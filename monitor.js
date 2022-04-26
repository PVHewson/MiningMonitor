let response = await fetch('https://api.beta.luxor.tech/graphql', {
  method: 'POST',
  headers: {
    'x-lux-api-key': 'lxk.3359bba3326258d460393d4bf41227bc',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    query: "{currentProfile{email}}"
  }),
});

response = await fetch('https://api.beta.luxor.tech/graphql', {
  method: 'POST',
  headers: {
    'x-lux-api-key': 'lxk.3359bba3326258d460393d4bf41227bc',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    query: "{miners(first:2){nodes{workerName,details24H{status,hashrate}}}}"
  }),
});

response = await fetch('https://api.beta.luxor.tech/graphql', {
  method: 'POST',
  headers: {
    'x-lux-api-key': 'lxk.3359bba3326258d460393d4bf41227bc',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    query: "{miners(first:2){nodes{workerName,details(duration:{days:3}){status,hashrate}}}}"
  }),
});