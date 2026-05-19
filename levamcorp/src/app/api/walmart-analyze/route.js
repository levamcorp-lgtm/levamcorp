import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const ordersFile = formData.get('orders')
    const returnsFile = formData.get('returns')
    const settlementFile = formData.get('settlement')
    const rtsFile = formData.get('rts')
    const analysisName = formData.get('name') || 'Walmart Analysis'

    // Parse CSV/Excel files
    const parseCSV = (text) => {
      const lines = text.trim().split('\n')
      if (lines.length < 2) return []
      const headers = lines[0].split(',').map(h => h.replace(/["=]/g, '').trim())
      return lines.slice(1).map(line => {
        const values = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
        const obj = {}
        headers.forEach((h, i) => {
          obj[h] = (values[i] || '').replace(/["=]/g, '').trim()
        })
        return obj
      }).filter(r => Object.values(r).some(v => v))
    }

    const parseSettlement = (text) => {
      const lines = text.trim().split('\n')
      // Find header row (line 3, index 3)
      const headerLine = lines[3]
      if (!headerLine) return { data: [], period: {} }
      const headers = headerLine.split(',').map(h => h.replace(/["]/g, '').trim())
      const data = lines.slice(4).map(line => {
        const values = line.match(/(".*?"|[^,]+)(?=,|$)/g) || []
        const obj = {}
        headers.forEach((h, i) => {
          obj[h] = (values[i] || '').replace(/["=]/g, '').trim()
        })
        return obj
      }).filter(r => Object.values(r).some(v => v))
      // Extract period from lines 1-2
      const periodStart = lines[2]?.split(',')[0]?.replace(/["]/g, '').trim()
      const periodEnd = lines[2]?.split(',')[1]?.replace(/["]/g, '').trim()
      return { data, period: { start: periodStart, end: periodEnd } }
    }

    const parseXLSX = async (buffer) => {
      // Simple XLSX text extraction - parse as CSV-like
      // For now return empty - we'll handle client-side
      return []
    }

    // Read files
    let ordersData = [], returnsData = [], settlementData = [], rtsData = [], settlementPeriod = {}

    if (settlementFile) {
      const text = await settlementFile.text()
      const parsed = parseSettlement(text)
      settlementData = parsed.data
      settlementPeriod = parsed.period
    }

    if (rtsFile) {
      const text = await rtsFile.text()
      rtsData = parseCSV(text)
    }

    // ANALYSIS ENGINE
    const cleanId = (val) => (val || '').replace(/[=""\s]/g, '').trim()

    // Settlement grouping
    const settlementByType = {}
    settlementData.forEach(row => {
      const type = row['Transaction Type'] || 'Unknown'
      if (!settlementByType[type]) settlementByType[type] = { count: 0, total: 0, rows: [] }
      const amount = parseFloat(row['Net Payable']) || 0
      settlementByType[type].count++
      settlementByType[type].total += amount
      settlementByType[type].rows.push(row)
    })

    // Fee totals
    const fulfillmentFees = settlementByType['FulfillmentFee']?.total || 0
    const returnFees = settlementByType['ReturnProcessingFee']?.total || 0
    const storageFees = settlementByType['StorageFee']?.total || 0
    const inboundFees = settlementByType['InboundTransportationFee']?.total || 0
    const refunds = Math.abs(settlementByType['Refund']?.total || 0)
    const lostInventory = settlementByType['LostInventory']?.total || 0
    const inventoryRemoval = settlementByType['InventoryRemovalOrder']?.total || 0
    const rtvFees = settlementByType['RC_InventoryRTVFee']?.total || 0
    const totalFees = Object.values(settlementByType).reduce((s, v) => s + (v.total > 0 ? v.total : 0), 0)
    const totalCredits = Math.abs(Object.values(settlementByType).reduce((s, v) => s + (v.total < 0 ? v.total : 0), 0))
    const netPayable = Object.values(settlementByType).reduce((s, v) => s + v.total, 0)

    // ALERTS
    const alerts = []

    // Alert: Large inventory removal
    if (inventoryRemoval > 500) {
      const rows = settlementByType['InventoryRemovalOrder']?.rows || []
      alerts.push({
        type: 'warning',
        severity: 'high',
        title: `Large Inventory Removal Fee: $${inventoryRemoval.toFixed(2)}`,
        description: `Walmart charged you $${inventoryRemoval.toFixed(2)} to remove inventory from their warehouse. Verify this was authorized.`,
        details: rows.map(r => ({ item: r['Partner Item Name'], amount: r['Net Payable'], date: r['Transaction Date/Time'] }))
      })
    }

    // Alert: Lost inventory
    if (lostInventory < 0) {
      alerts.push({
        type: 'info',
        severity: 'medium',
        title: `Lost Inventory Credit: $${Math.abs(lostInventory).toFixed(2)}`,
        description: `Walmart owes you $${Math.abs(lostInventory).toFixed(2)} for inventory they lost in their warehouse. Verify you received this credit.`,
      })
    }

    // Alert: Return fees vs returns discrepancy
    const returnFeeCount = settlementByType['ReturnProcessingFee']?.count || 0

    // Alert: Refunds
    if (refunds > 0) {
      const refundRows = settlementByType['Refund']?.rows || []
      alerts.push({
        type: 'warning',
        severity: 'medium',
        title: `${refundRows.length} Refund(s) Issued: -$${refunds.toFixed(2)}`,
        description: `Walmart issued ${refundRows.length} refund(s) totaling $${refunds.toFixed(2)}. Review each refund to ensure they are valid.`,
        details: refundRows.map(r => ({ item: r['Partner Item Name'], amount: r['Net Payable'], date: r['Transaction Date/Time'], order: cleanId(r['Walmart.com Order #']) }))
      })
    }

    // Alert: Storage fees
    if (storageFees > 0) {
      alerts.push({
        type: 'info',
        severity: 'low',
        title: `Storage Fees Charged: $${storageFees.toFixed(2)}`,
        description: `You were charged $${storageFees.toFixed(2)} in storage fees. Consider moving slow-moving inventory to avoid future charges.`,
      })
    }

    // Alert: High return processing fees
    if (returnFees > 200) {
      alerts.push({
        type: 'warning',
        severity: 'medium',
        title: `High Return Processing Fees: $${returnFees.toFixed(2)}`,
        description: `${returnFeeCount} returns were processed costing $${returnFees.toFixed(2)}. Review your product listings for quality issues.`,
      })
    }

    // Summary
    const summary = {
      period: settlementPeriod,
      settlement: {
        fulfillmentFees: Math.round(fulfillmentFees * 100) / 100,
        returnProcessingFees: Math.round(returnFees * 100) / 100,
        storageFees: Math.round(storageFees * 100) / 100,
        inboundTransportation: Math.round(inboundFees * 100) / 100,
        inventoryRemoval: Math.round(inventoryRemoval * 100) / 100,
        rtvFees: Math.round(rtvFees * 100) / 100,
        refundsIssued: Math.round(refunds * 100) / 100,
        lostInventoryCredit: Math.round(Math.abs(lostInventory) * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        totalCredits: Math.round(totalCredits * 100) / 100,
        netPayable: Math.round(netPayable * 100) / 100,
      },
      counts: {
        settlementRows: settlementData.length,
        fulfillmentFeeOrders: settlementByType['FulfillmentFee']?.count || 0,
        returnFeeCount,
        rtsCount: rtsData.length,
      },
      byType: Object.entries(settlementByType).map(([type, data]) => ({
        type,
        count: data.count,
        total: Math.round(data.total * 100) / 100
      })).sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
    }

    // Save to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: saved, error } = await supabase
      .from('walmart_analyses')
      .insert([{
        name: analysisName,
        period_start: settlementPeriod.start || null,
        period_end: settlementPeriod.end || null,
        settlement_data: settlementData.slice(0, 500),
        rts_data: rtsData,
        summary,
        alerts,
      }])
      .select()
      .single()

    if (error) throw error

    return Response.json({ success: true, analysis: saved })
  } catch (error) {
    console.error('Walmart analyze error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
