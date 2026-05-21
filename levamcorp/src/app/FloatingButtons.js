'use client'
import { usePathname } from 'next/navigation'

export default function FloatingButtons() {
  const path = usePathname()
  if (path?.startsWith('/mobile')) return null

  const waUrl = `https://wa.me/17864909005?text=${encodeURIComponent('Hi! I found you on levamcorp.com and I have a question.')}`

  return (
    <>
      {/* WHATSAPP */}
      <a href={waUrl} target="_blank" rel="noopener noreferrer"
        style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9998, display: 'flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', borderRadius: 50, padding: '12px 20px 12px 14px', boxShadow: '0 4px 20px rgba(37,211,102,0.45)', textDecoration: 'none', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', fontSize: 13, fontWeight: 700 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Chat with us
      </a>

      {/* CHATBOT TOGGLE */}
      <div id="levam-chat-root">
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var isTyping = false;
            var messages = [];

            function createChat() {
              var style = document.createElement('style');
              style.textContent = \`
                #lc-toggle { position:fixed; bottom:96px; right:28px; z-index:9999; width:52px; height:52px; background:#111; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(0,0,0,0.35); transition:all 0.2s; }
                #lc-toggle:hover { transform:scale(1.08); background:#222; }
                #lc-window { position:fixed; bottom:168px; right:28px; z-index:9999; width:340px; height:480px; background:#fff; border-radius:12px; box-shadow:0 8px 40px rgba(0,0,0,0.18); display:none; flex-direction:column; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
                #lc-window.open { display:flex; animation:lc-pop 0.2s ease; }
                @keyframes lc-pop { from{transform:scale(0.9) translateY(10px);opacity:0} to{transform:scale(1);opacity:1} }
                #lc-header { background:linear-gradient(135deg,#0d0d0d,#1a1a2e); padding:14px 16px; display:flex; align-items:center; gap:10px; }
                #lc-msgs { flex:1; overflow-y:auto; padding:14px; background:#f7f8fa; display:flex; flex-direction:column; gap:10px; }
                .lc-msg { max-width:84%; padding:10px 14px; border-radius:12px; font-size:13px; line-height:1.6; }
                .lc-msg.bot { background:#fff; color:#333; border:0.5px solid rgba(0,0,0,0.08); border-radius:4px 12px 12px 12px; align-self:flex-start; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
                .lc-msg.user { background:#2d7dd2; color:#fff; border-radius:12px 4px 12px 12px; align-self:flex-end; }
                .lc-typing { display:flex; gap:5px; padding:10px 14px; background:#fff; border-radius:4px 12px 12px 12px; border:0.5px solid rgba(0,0,0,0.08); align-self:flex-start; }
                .lc-dot { width:7px; height:7px; background:#bbb; border-radius:50%; animation:lc-bounce 1.2s infinite; }
                .lc-dot:nth-child(2){animation-delay:0.2s} .lc-dot:nth-child(3){animation-delay:0.4s}
                @keyframes lc-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
                #lc-footer { padding:10px 12px; background:#fff; border-top:0.5px solid rgba(0,0,0,0.08); display:flex; gap:8px; align-items:center; }
                #lc-input { flex:1; border:1.5px solid #e5e7eb; border-radius:20px; padding:9px 14px; font-size:13px; outline:none; font-family:inherit; color:#333; }
                #lc-input:focus { border-color:#2d7dd2; }
                #lc-send { width:36px; height:36px; background:#2d7dd2; border:none; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .lc-quick { display:flex; flex-wrap:wrap; gap:5px; padding:0 14px 10px; }
                .lc-quick button { font-size:11px; padding:5px 10px; background:#fff; border:0.5px solid rgba(45,125,210,0.3); color:#2d7dd2; border-radius:14px; cursor:pointer; font-family:inherit; }
              \`;
              document.head.appendChild(style);

              var toggle = document.createElement('button');
              toggle.id = 'lc-toggle';
              toggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

              var win = document.createElement('div');
              win.id = 'lc-window';
              win.innerHTML = \`
                <div id="lc-header">
                  <div style="width:38px;height:38px;background:rgba(45,125,210,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:1.5px solid rgba(45,125,210,0.3)">🤖</div>
                  <div style="flex:1"><div style="font-size:13px;font-weight:700;color:#fff">Levam Assistant</div><div style="font-size:10px;color:#555;margin-top:2px"><span style="width:6px;height:6px;background:#25D366;border-radius:50%;display:inline-block;margin-right:5px"></span>Online</div></div>
                  <button onclick="document.getElementById('lc-window').classList.remove('open')" style="background:rgba(255,255,255,0.08);border:none;color:#666;cursor:pointer;width:26px;height:26px;border-radius:50%;font-size:16px;display:flex;align-items:center;justify-content:center">×</button>
                </div>
                <div id="lc-msgs"></div>
                <div class="lc-quick" id="lc-quick"></div>
                <div id="lc-footer">
                  <input id="lc-input" placeholder="Ask me anything..." />
                  <button id="lc-send"><svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg></button>
                </div>
              \`;

              document.body.appendChild(toggle);
              document.body.appendChild(win);

              addBotMessage('Hi! I am the Levam Corp assistant. Ask me anything about our wholesale products, how to apply, or how we work. I also speak Spanish!');
              showQuickReplies(['How do I apply?', 'What products?', 'Contact / WhatsApp']);

              toggle.addEventListener('click', function() { win.classList.toggle('open'); });
              document.getElementById('lc-input').addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });
              document.getElementById('lc-send').addEventListener('click', sendMessage);
            }

            function showQuickReplies(opts) {
              var c = document.getElementById('lc-quick'); if (!c) return; c.innerHTML = '';
              opts.forEach(function(opt) { var b = document.createElement('button'); b.textContent = opt; b.onclick = function() { c.innerHTML = ''; document.getElementById('lc-input').value = opt; sendMessage(); }; c.appendChild(b); });
            }
            function addBotMessage(t) { var m = document.getElementById('lc-msgs'); var d = document.createElement('div'); d.className = 'lc-msg bot'; d.textContent = t; m.appendChild(d); m.scrollTop = m.scrollHeight; messages.push({role:'assistant',content:t}); }
            function addUserMessage(t) { var m = document.getElementById('lc-msgs'); var d = document.createElement('div'); d.className = 'lc-msg user'; d.textContent = t; m.appendChild(d); m.scrollTop = m.scrollHeight; messages.push({role:'user',content:t}); }
            function showTyping() { var m = document.getElementById('lc-msgs'); var d = document.createElement('div'); d.className = 'lc-typing'; d.id = 'lc-typing'; d.innerHTML = '<div class="lc-dot"></div><div class="lc-dot"></div><div class="lc-dot"></div>'; m.appendChild(d); m.scrollTop = m.scrollHeight; }
            function hideTyping() { var e = document.getElementById('lc-typing'); if (e) e.remove(); }
            async function sendMessage() {
              var input = document.getElementById('lc-input'); var text = (input.value||'').trim(); if (!text || isTyping) return;
              input.value = ''; document.getElementById('lc-quick').innerHTML = ''; addUserMessage(text); isTyping = true; showTyping();
              try {
                var res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({messages: messages.slice(-10)}) });
                var data = await res.json(); hideTyping(); addBotMessage(data.reply || 'Please contact us on WhatsApp!');
              } catch(e) { hideTyping(); addBotMessage('Sorry, reach us on WhatsApp at (786) 490-9005!'); }
              isTyping = false;
            }
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createChat);
            else createChat();
          })();
        `}} />
      </div>
    </>
  )
}
