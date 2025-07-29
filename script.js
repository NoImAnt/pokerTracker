let players = [];

function getChipValue() {
  const val = parseFloat(document.getElementById('chipValueInput').value);
  return isNaN(val) || val <= 0 ? 0.25 : val;
}

function addPlayer() {
  const nameInput = document.getElementById('playerName');
  const buyInInput = document.getElementById('buyIn');

  const name = nameInput.value;
  const buyIn = parseFloat(buyInInput.value);
  const chipValue = getChipValue();

  if (!name || isNaN(buyIn)) {
    alert("Please enter a valid name and buy-in amount.");
    return;
  }

  const chips = buyIn / chipValue;

  const player = {
    name,
    buyIn,
    chips,
    remainingChips: chips
  };

  players.push(player);
  showPlayers();
  savePlayers();  // <-- Save after adding

  nameInput.value = "";
  buyInInput.value = "";
}

function updateRemaining(index, value) {
  const newVal = parseFloat(value);
  if (!isNaN(newVal)) {
    players[index].remainingChips = newVal;
    showPlayers();
    savePlayers();  // <-- Save after update
  }
}

function showPlayers() {
  const chipValue = getChipValue();
  let output = "";

  players.forEach((player, index) => {
    const cashOut = player.remainingChips * chipValue;

    output += `
      <div style="margin-bottom: 10px;">
        <strong>${player.name}</strong><br/>
        Buy-in: $${player.buyIn.toFixed(2)} | 
        Chips: ${player.chips} <br/>
        Remaining Chips: 
        <input type="number" value="${player.remainingChips}" 
               onchange="updateRemaining(${index}, this.value)" 
               style="width: 60px;" />
        → Cash Out: $${cashOut.toFixed(2)} 
        <button onclick="removePlayer(${index})" style="margin-left:10px; cursor:pointer;">Remove</button>
      </div>
    `;
  });

  document.querySelector("#output").innerHTML = output;
}

function savePlayers() {
  localStorage.setItem('players', JSON.stringify(players));
}

function loadPlayers() {
  const saved = localStorage.getItem('players');
  if (saved) {
    players = JSON.parse(saved);
    showPlayers();  // <-- Use showPlayers to update UI
  }
}

function removePlayer(index) {
  players.splice(index, 1);  // Remove player at given index
  showPlayers();
  savePlayers();             // Save updated list
}

window.onload = loadPlayers;
