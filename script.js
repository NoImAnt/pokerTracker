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
    report = "All players have settled balances.";
  } else {
    report = `<table style="width:100%; border-collapse: collapse;">
      <thead>
        <tr>
        </tr>
      </thead>
      <tbody>`;

    losers.forEach(loser => {
      let amountOwed = -loser.profit; // positive amount loser owes

      winners.forEach(winner => {
        if (amountOwed <= 0) return;

        const winnerShare = winner.profit;
        if (winnerShare <= 0) return;

        // How much loser pays this winner
        const payment = Math.min(amountOwed, winnerShare);

        report += `<tr>
          <td style="padding: 6px; border-bottom: 1px solid #eee;">${loser.name}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee;">owes</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee;">${winner.name}</td>
          <td style="padding: 6px; border-bottom: 1px solid #eee; text-align:right;">$${payment.toFixed(2)}</td>
        </tr>`;

        // Update owed and winner profit
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