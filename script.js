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

  updateChipTotals();
}

function updateRemaining(index, value) {
  const newVal = parseFloat(value);
  if (!isNaN(newVal)) {
    players[index].remainingChips = newVal;
    showPlayers();
    savePlayers();  // <-- Save after update

    updateChipTotals();
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
    showPlayers();
    updateChipTotals();
  }
}

function removePlayer(index) {
  players.splice(index, 1);  // Remove player at given index
  showPlayers();
  savePlayers();             // Save updated list
  updateChipTotals();
}

window.onload = loadPlayers;

function generateReport() {
  const chipValue = getChipValue();

  // Calculate profit/loss for each player
  players.forEach(p => {
    p.profit = (p.remainingChips * chipValue) - p.buyIn;
  });

  const winners = players.filter(p => p.profit > 0);
  const losers = players.filter(p => p.profit < 0);

  let report = "";

  if (losers.length === 0) {
  report = "<p>All players have settled balances.</p>";
} else {
  report = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #4CAF50; color: white;">
          <th style="padding: 8px; border: 1px solid #ddd;">Loser</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Winner</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount ($)</th>
        </tr>
      </thead>
      <tbody>`;

  losers.forEach(loser => {
    let amountOwed = -loser.profit; // positive

    winners.forEach(winner => {
      if (amountOwed <= 0) return;
      if (winner.profit <= 0) return;

      const payment = Math.min(amountOwed, winner.profit);

      report += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${loser.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${winner.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${payment.toFixed(2)}</td>
        </tr>
      `;

      amountOwed -= payment;
      winner.profit -= payment;
    });
  });

  report += `</tbody></table>`;
}

  document.getElementById("report").innerHTML = report;
}


function updateChipTotals() {
  const totalChips = players.reduce((sum, p) => sum + p.chips, 0);
  const remainingChips = players.reduce((sum, p) => sum + p.remainingChips, 0);

  document.getElementById("totalChips").textContent = totalChips.toFixed(2);
  document.getElementById("remainingChips").textContent = remainingChips.toFixed(2);
}