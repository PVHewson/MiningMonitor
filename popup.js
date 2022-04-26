function constructPage(data) {  
  const history = document.getElementById("monitorHistory");

  if (data.luxorLastCheck) {
    let heading = document.createElement("h2");    
    heading.innerText = 'Most recent monitor results'
    history.appendChild(heading)
    let row = document.createElement("div");
    row.classList.add('row')
    let cell = document.createElement("div");
    cell.style.width = "140px";
    cell.innerText = 'Worker Name';
    cell.classList.add('cell','header')
    row.appendChild(cell);
    cell = document.createElement("div");
    cell.style.width = "140px";
    cell.innerText = 'Hash-rate';
    cell.classList.add('cell','header')
    row.appendChild(cell);

    cell = document.createElement("div");
    cell.style.width = "100px";
    cell.innerText = 'Status';
    cell.classList.add('cell','header')
    row.appendChild(cell);

    history.appendChild(row)

    data.luxorLastCheck.miners.forEach(miner => 
      {
        let row = document.createElement("div");
        row.classList.add('row')
        let cell = document.createElement("div");
        cell.style.width = "140px";
        cell.innerText = miner.workerName;
        cell.classList.add('cell')
        row.appendChild(cell);

        cell = document.createElement("div");
        cell.style.width = "140px";
        cell.innerText = `${Math.round(miner.details.hashrate / 10000000000) / 100} TH/hr`;
        cell.classList.add('cell')
        row.appendChild(cell);

        cell = document.createElement("div");
        cell.style.width = "100px";
        cell.innerText = miner.details.status;
        cell.classList.add('cell')
        row.appendChild(cell);

        history.appendChild(row)
    })
    let lastPolled = new Date(data.luxorLastCheck.time)
    let label = document.createElement("div");
    label.classList.add('info');
    label.innerText=`Last polled: ${formatDate(lastPolled)}`;
    history.appendChild(label);
    history.classList.remove('hidden');
  }

  if (data.luxorLastCheck.miners.filter(miner => miner.details.status !== 'Active').length > 0) {
    const btnAlert = document.getElementById("btnAlert");
    btnAlert.classList.remove('hidden');
    btnAlert.addEventListener('click', sendAlert(data));
  }
  
}
function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  console.log(date);
  return (
    [
      date.getFullYear(),
      padTo2Digits(date.getMonth() + 1),
      padTo2Digits(date.getDate()),
    ].join('-') +
    ' ' +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      padTo2Digits(date.getSeconds()),
    ].join(':')
  );
}

function sendAlert({ latestMinerCheck }, replacePage) {
  console.log(replacePage);
  if(latestMinerCheck) {
    const target = replacePage? '_self': '_blank';
    const issues = latestMinerCheck.data.miners.nodes.filter(miner => miner.details.status !== 'Active')
    .map(miner => `${miner.workerName} is ${miner.details.status}`)
    .toString();

    window.open(`https://mail.google.com/mail/u/0/?fs=1&to=${hostEmail.value}&su=Miner offline&body=${issues}&tf=cm`, target);
  }
}
chrome.storage.sync.get(null, constructPage);
