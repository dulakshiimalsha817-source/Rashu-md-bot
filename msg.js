
const axios = require('axios');

module.exports = async (sock, m) => {
  try {
    const from = m.key.remoteJid;
    const type = Object.keys(m.message)[0];
    const body = type === 'conversation'
      ? m.message.conversation
      : m.message[type]?.text || '';
    const command = body.split(' ')[0].toLowerCase();
    const query = body.replace(command, '').trim();

    // group info
    const isGroup = from.endsWith('@g.us');
    let admins = [];
    if (isGroup) {
      const metadata = await sock.groupMetadata(from);
      admins = metadata.participants.filter(x => x.admin).map(x => x.id);
    }
    const isAdmin = admins.includes(m.key.participant);

    switch(command){

      case 'menu':
        return sock.sendMessage(from,{
          text:`💠 *FULL MENU*
• alive
• sticker
• logo <text>
• ai <text>
• song <name>
• tiktok <url>
• yt <url>
• promote @tag
• demote @tag
• tagall
• autoreply-on/off
• autorecat-on/off`,
          buttons:[
            {buttonId:'alive',buttonText:{displayText:'Alive'},type:1},
            {buttonId:'tagall',buttonText:{displayText:'Tag All'},type:1},
            {buttonId:'autoreply-on',buttonText:{displayText:'AutoReply ON'},type:1}
          ]
        });

      case 'alive':
        return sock.sendMessage(from,{ text:'Bot is Alive 🟢' });

      // ----- AI Chat Mode -----
      case 'ai':
        if(!query) return sock.sendMessage(from,{text:'FREE DEPLOY SANNU MD MINI BOT'});
        return sock.sendMessage(from,{text:'🤖 AI: ' + query});

      // ----- Downloaders -----
      case 'song':
        if(!query) return sock.sendMessage(from,{text:'𝚂𝙰𝙽𝙽𝚄 𝙼𝙳 𝚂𝙾𝙽𝙶 🥷'});
        try{
          let api = `https://api.viper-x.xyz/api/song?text=${encodeURIComponent(query)}`;
          let r = await axios.get(api);
          await sock.sendMessage(from,{audio:{url:r.data.result.download_url},mimetype:'audio/mpeg'});
        }catch(e){ sock.sendMessage(from,{text:'Song error'}); }
        break;

      case 'tiktok':
        if(!query) return sock.sendMessage(from,{text:'TikTok url දෙන්න'});
        try{
          let api = `https://api.viper-x.xyz/api/tiktok?url=${encodeURIComponent(query)}`;
          let r = await axios.get(api);
          await sock.sendMessage(from,{video:{url:r.data.result.video}});
        }catch(e){ sock.sendMessage(from,{text:'TikTok error'}); }
        break;

      case 'yt':
        if(!query) return sock.sendMessage(from,{text:'YT url දෙන්න'});
        try{
          let api = `https://api.viper-x.xyz/api/ytmp4?url=${encodeURIComponent(query)}`;
          let r = await axios.get(api);
          await sock.sendMessage(from,{video:{url:r.data.result.url}});
        }catch(e){ sock.sendMessage(from,{text:'YT error'}); }
        break;

      // ----- Sticker -----
      case 'sticker':
        if (!m.message.imageMessage)
          return sock.sendMessage(from,{text:'Image එකට reply → sticker'});
        const img = await sock.downloadMediaMessage(m);
        return sock.sendMessage(from,{sticker:img});

      // ----- Logo Maker -----
      case 'logo':
        if(!query) return sock.sendMessage(from,{text:'𝚂𝙰𝙽𝙽𝚄 𝙼𝙳 𝙼𝙸𝙽𝙸 𝙻𝙾𝙳𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳'});
        return sock.sendMessage(from,{image:{url:`https://api.viper-x.xyz/api/logo?text=${encodeURIComponent(query)}`}});

      // ----- Admin -----
      case 'promote':
        if(!isGroup || !isAdmin) return;
        if (!m.message.extendedTextMessage?.contextInfo?.mentionedJid)
          return sock.sendMessage(from,{text:'Tag user'});
        let pid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        await sock.groupParticipantsUpdate(from,[pid],"promote");
        return sock.sendMessage(from,{text:'Promoted ✓'});

      case 'demote':
        if(!isGroup || !isAdmin) return;
        if (!m.message.extendedTextMessage?.contextInfo?.mentionedJid)
          return sock.sendMessage(from,{text:'Tag user'});
        let did = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
        await sock.groupParticipantsUpdate(from,[did],"demote");
        return sock.sendMessage(from,{text:'Demoted ✓'});

      case 'tagall':
        if(!isGroup) return;
        let members = admins;
        return sock.sendMessage(from,{text:'Tagging All',mentions:members});

      // ----- Auto Systems -----
      case 'autoreply-on': global.autoReply=true; return sock.sendMessage(from,{text:'AutoReply ON'});
      case 'autoreply-off': global.autoReply=false; return sock.sendMessage(from,{text:'AutoReply OFF'});
      case 'autorecat-on': global.autoRecat=true; return sock.sendMessage(from,{text:'AutoRecat ON'});
      case 'autorecat-off': global.autoRecat=false; return sock.sendMessage(from,{text:'AutoRecat OFF'});
    }

    if(global.autoReply && body.length<12)
      sock.sendMessage(from,{text:'🟢 Auto reply active'});

    if(global.autoRecat && body.includes('hi'))
      sock.sendMessage(from,{text:'Hello 👋'});

  } catch(e){
    console.log(e);
  }
};
