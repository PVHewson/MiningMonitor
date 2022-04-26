let header = document.getElementById("header");
let inputs = document.getElementById("inputs");
let actions = document.getElementById("actions");
let apiKey = document.getElementById("apikey");
let frequency = document.getElementById("frequency");
let hostEmail = document.getElementById("hostEmail");

function constructPage(data) {  
  const btnSave = document.getElementById("btnSave");

  if(data.luxorHostEmail) hostEmail.value = data.luxorHostEmail;

  if (data.luxorOption && data.luxorOption == 'alert-host') { 
    chrome.storage.sync.remove("luxorOption");
    header.innerText = 'Host Alert'
    sendAlert(data, true);
    return;
  }

  header.innerText = 'Luxor Mining Monitor Options';
  if(data.luxorApiKey) apiKey.value = data.luxorApiKey;
  if(data.luxorFrequency) frequency.value = data.luxorFrequency;
  if(data.luxorHostEmail) hostEmail.value = data.luxorHostEmail;

  btnSave.addEventListener('click', saveChanges);

  inputs.classList.remove('hidden');
  actions.classList.remove('hidden');
}

function saveChanges(event) {
  const luxorApiKey = apiKey.value;
  const luxorFrequency = parseFloat(frequency.value);
  const luxorHostEmail = hostEmail.value;
  if (luxorApiKey=="") {
    chrome.storage.sync.remove("luxorApiKey");
  } else {
    chrome.storage.sync.set({ luxorApiKey });
  }  

  if (!isNaN(luxorFrequency)) {
    chrome.storage.sync.set({ luxorFrequency });
  }  

  if (luxorHostEmail=="") {
    chrome.storage.sync.remove("luxorHostEmail");
  } else {
    chrome.storage.sync.set({ luxorHostEmail });
  }  
  window.close();
}

chrome.storage.sync.get(null, constructPage);