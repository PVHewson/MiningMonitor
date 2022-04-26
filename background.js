let latestMinerCheck;

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const alarmListener = (alarm) => {
  switch (alarm.name) {
    case 'Check miners' : 
      checkMiner();
      break;
    default :
      console.log(`Unmanaged alarm '${alarm.name}'`)
  }
}

const notificationButtonClicked = async (notificationId, buttonIndex) => {
  switch (notificationId) {
    case 'luxorProblem' :
      chrome.storage.sync.set({luxorOption : 'alert-host'}, () => chrome.runtime.openOptionsPage());       
      break;
    default :
      console.log(`Unmanaged notification button for '${notificationId}'`)
  }
}

const minerErrorNotification = (notificationId) => {
  console.log(chrome.runtime.lastError)
};
 
const checkMiner = async () => {
  // const tab = await getCurrentTab();
  // chrome.scripting.executeScript({
  //   target: {tabId: tab.id},
  //   files: ['content.js']
  // });

  chrome.storage.sync.get("luxorApiKey", async (data) => {
    console.log('check miner');
    if (data.luxorApiKey == undefined) {
      console.log('no key');
      return;
    }

    let luxorLastCheck = {
      time: Date.now()
    }

    response = await fetch('https://api.beta.luxor.tech/graphql', {
      method: 'POST',
      headers: {
        'x-lux-api-key': data.luxorApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: "{miners(first:2){nodes{workerName,details(duration:{minutes:15}){status,hashrate}}}}"
      }),
    });
  
    
    latestMinerCheck = await response.json();
    console.log(latestMinerCheck);
    if (latestMinerCheck.errors) {
        luxorLastCheck.errors = latestMinerCheck.errors;
        const notificationOptions = {
          type: 'list', 
          iconUrl: './images/get_started16.png',
          message: `Miner check error`, 
          title: 'Mine monitor: Miner check error',
          requireInteraction: false,
          items: responseJSON.errors.map( error => { return {title: '', message: error.extensions.exception.detail}})
        };
        await chrome.notifications.clear('luxorError');
        chrome.notifications.create('LuxorError', notificationOptions, minerErrorNotification);
    
    } else {
      const miners = latestMinerCheck.data.miners.nodes;
      const activeMiners = miners.filter(miner => miner.details.status == 'Active');
      const problemMiners = miners.filter(miner => miner.details.status !== 'Active');
      luxorLastCheck.miners = miners;
      await chrome.notifications.clear('luxorActive');

      if(problemMiners.length > 0) {
        let notificationOptions = {
          type: 'list', 
          iconUrl: './images/get_started16.png',
          message: `Miner issues detected`, 
          title: 'Mine monitor: Miner issues detected',
          requireInteraction: true,
          items: problemMiners.map( miner => { return {title: miner.workerName, message: miner.details.status}})
        };
        await chrome.notifications.clear('luxorProblem');
        chrome.storage.sync.get("luxorHostEmail", (data) => {
          if(data.luxorHostEmail) {
            notificationOptions.buttons = [{title: 'Alert Host'}];
          }
          console.log('create alert');
          chrome.notifications.create('luxorProblem', notificationOptions);  
        });      
  
      } else {
        if(activeMiners.length > 0) {
          const notificationOptions = {
            type: 'list', 
            iconUrl: './images/get_started16.png',
            message: `No miner issues detected`, 
            title: 'Mine monitor: No miner issues detected',
            requireInteraction: false,
            items: activeMiners.map( miner => { return {title: miner.workerName, message: miner.details.status}})
          };
          chrome.notifications.create('luxorActive', notificationOptions);  
        }    
      } 
    }

    chrome.storage.sync.set({ luxorLastCheck });  
  })
}

const loadMinerAlarm = () => {
  chrome.storage.sync.get("luxorApiKey", (data) => {
    if (data.luxorApiKey == undefined) {
      console.log('no key');
      return;
    }

    chrome.storage.sync.get("luxorFrequency", (data) => {
      const frequency = data.luxorFrequency || 60;
      console.log(`checking miners every ${frequency} minutes`);
      chrome.alarms.clear('Check miners')
      chrome.alarms.create('Check miners', {periodInMinutes: frequency});
    })
  })
}

const storageChanged = event => {
  if (event.luxorFrequency || event.luxorApiKey) loadMinerAlarm()
}

chrome.runtime.onInstalled.addListener(() => {
  loadMinerAlarm()
  chrome.storage.onChanged.addListener(storageChanged);
  chrome.alarms.onAlarm.addListener( alarmListener);
  chrome.notifications.onButtonClicked.addListener( notificationButtonClicked );
});
