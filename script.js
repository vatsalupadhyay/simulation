const btnDynamic = document.getElementById("btnDynamic");
const btnGreedy = document.getElementById("btnGreedy");
const btnPause = document.getElementById("btnPause");
const btnPlay = document.getElementById("btnPlay");

btnDynamic.onclick = () => {
  runSimulation();
};

btnGreedy.onclick = () => {
  runGreedy();
};

btnPause.onclick = () => {
  btnPlay.style.display = "block";
  btnPause.style.display = "none";
  if (greedyRunning) {
    wasPausedGreedy = true;
    clearInterval(greedyInterval);
  } else if (dynamicRunning) {
    wasPaused = true;
    clearInterval(dynamicInterval);
  } else if (backtrackRunning) {
    wasPaused = true;
    clearInterval(backtrackInterval);
  }
};

btnPlay.onclick = () => {
  if (greedyRunning) played = 1;
  else played = 0;
  btnPlay.style.display = "none";
  btnPause.style.display = "block";
  if (greedyRunning) {
    const coinsInput = document.getElementById("coins").value;
    const amount = parseInt(document.getElementById("amount").value);
    let coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, coinSet } = coinChangeGreedy(coins, amount);

    displaySimulationGreedy(tempAmount, coins, result, coinSet, iGreedy);
  } else if (dynamicRunning) {
    const amount = parseInt(document.getElementById("amount").value);
    const coinsInput = document.getElementById("coins").value;
    const coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, table } = coinChangeDynamic(amount, coins);
    const coinsUsed = findCoinsUsed(table);
    displaySimulationDynamic(result, table, iDynamic, jDynamic, coinsUsed);
  } else if (backtrackRunning) {
    const amount = parseInt(document.getElementById("amount").value);
    const coinsInput = document.getElementById("coins").value;
    const coins = coinsInput.split(" ").map((coin) => parseInt(coin));

    const { result, table } = coinChangeDynamic(amount, coins);
    const coinsUsed = findCoinsUsed(table);
    displayBacktracking(
      coinsUsed,
      table,
      result,
      stepBack,
      iBacktrack,
      jBacktrack
    );
  }
};

{
  /* //loop variables */
}
let iDynamic = 1;
let jDynamic = 1;
let iBacktrack;
let jBacktrack;
let iGreedy = 0;
let step = 0;
let stepBack = 1;
let tempAmount;
let wasPausedGreedy = false;
let wasPaused = false;
let played = 0;

//interval variables
let greedyInterval;
let dynamicInterval;
let backtrackInterval;

//running variables
let dynamicRunning = false;
let greedyRunning = false;
let backtrackRunning = false;

function runSimulation() {
  if (dynamicRunning || greedyRunning || backtrackRunning) {
    // window.alert('Simulation already running. Please wait or end the Simulation.');
    return;
  }

  const amount = parseInt(document.getElementById("amount").value);
  const coinsInput = document.getElementById("coins").value;

  if (isNaN(amount)) {
    window.alert("Enter Amount");
    return;
  }
  if (isNaN(parseFloat(coinsInput))) {
    window.alert("Enter Coins");
    return;
  }

  btnPause.style.display = "block";
  btnDynamic.style.display = "none";
  btnGreedy.style.display = "none";

  dynamicRunning = true;
  step = 1;
  const coins = coinsInput.split(" ").map((coin) => parseInt(coin));
  const { result, table } = coinChangeDynamic(amount, coins);

  const coinsUsed = findCoinsUsed(table);
  displaySimulationDynamic(result, table, 1, 1, coinsUsed);

  iBacktrack = table.length - 1;
  jBacktrack = table[0].length - 1;
}

function coinChangeDynamic(amount, coins) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  const table = [];
  const amt = [];
  for (let i = 0; i <= amount; i++) {
    amt.push(i);
  }
  table.push(amt);
  for (const coin of coins) {
    const row = [coin];
    for (let i = 1; i <= amount; i++) {
      const withoutCoin = dp[i];
      const withCoin = i >= coin ? dp[i - coin] + 1 : Infinity;

      dp[i] = Math.min(withoutCoin, withCoin);
      row.push(dp[i]);
    }
    table.push(row);
  }

  return { result: dp[amount] === Infinity ? -1 : dp[amount], table };
}

function displaySimulationDynamic(result, table, i, j, coinsUsed) {
  const outputDiv = document.getElementById("output");
  if (result === -1) {
    outputDiv.innerHTML = "No valid combination.";
    return;
  }
  if (iDynamic == 1 && jDynamic == 1)
    outputDiv.innerHTML =
      "Create a Table of size (No. of coins)x(Amount from 1)";

  const explainDiv = document.getElementById("explain");
  if (iDynamic == 1 && jDynamic == 1)
    explainDiv.innerHTML = "Calculate Minimum No. of coins required.";

  const tableContainer = document.getElementById("table-container");
  if (iDynamic == 1 && jDynamic == 1) tableContainer.innerHTML = "";

  if (iDynamic == 1 && jDynamic == 1)
    displayTableSim(tableContainer, table, -1, -1, 0);

  dynamicInterval = setInterval(() => {
    if (i >= table.length) {
      iDynamic = 1;
      jDynamic = 1;
      clearInterval(dynamicInterval);
      dynamicRunning = false;
      displayBacktracking(
        coinsUsed,
        table,
        result,
        step,
        iBacktrack,
        jBacktrack
      );
      return;
    }
    displayTableSim(tableContainer, table, i, j, step);

    if (j >= table[0].length) {
      j = 1;
      jDynamic = 1;
      i++;
      iDynamic++;
      return;
    }

    {
      //Output and Explain div rules
      //first row
      if (i == 1) {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j} using denomination '${table[i][0]}'.`;
        explainDiv.innerHTML = `No. of denomination '${table[i][0]}' coins required for Sum ${j}`;
      }
      //Copying from above
      else if (j < table[i][0]) {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j}, denomination '${table[i][0]}' can be used with above denomination(s)`;
        explainDiv.innerHTML = `Denomination greater than sum, take above value`;
      }
      //sum equal to coin
      else if (j == table[i][0]) {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j}, denomination '${table[i][0]}' can be used with above denomination(s)`;
        explainDiv.innerHTML = `Only 1 coin required.`;
      } else {
        outputDiv.innerHTML = `Calculating number of coins for sum ${j}, denomination '${table[i][0]}' can be used with above denomination(s)`;
        explainDiv.innerHTML = `Min(dp[row-1], dp[sum - coin] + 1 ) = ${table[i][j]}`;
      }
    }
    j++; // Move to the next column
    jDynamic++;
  }, step * 1000); // Adjust the interval time as needed
}

function displayTableSim(container, data, highlightRow, highlightColumn, step) {
  step += 500;
  const table = document.createElement("table");
  const header = table.createTHead();
  const body = table.createTBody();

  // Create header row
  const headerRow = header.insertRow();
  headerRow.insertCell().textContent = "Coins";

  for (let i = 1; i < data[0].length; i++) {
    headerRow.insertCell().textContent = `Sum ${i}`;
  }

  // Create data rows
  for (let j = 1; j < data.length; j++) {
    const dataRow = body.insertRow();
    for (let k = 0; k < data[j].length; k++) {
      const cellElement = dataRow.insertCell();

      //highlight border

      //on that cell
      if (highlightRow == -1 && highlightColumn == -1)
        cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
      else if (j === highlightRow && k === highlightColumn)
        cellElement.style.borderColor = "#f20000";
      //one coin required
      else if (j === highlightRow && k === highlightColumn && data[j][k] == 1)
        cellElement.style.borderColor = "#f20000";
      //copying from above
      else if (
        j === highlightRow - 1 &&
        k === highlightColumn &&
        data[highlightRow][0] > data[0][k]
      ) {
        cellElement.style.borderColor = "#f20000";
        setTimeout(() => {
          cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
        }, step);
      }
      //comparing two values
      //upper value
      else if (
        j === highlightRow - 1 &&
        k === highlightColumn &&
        data[highlightRow][k] != 1
      ) {
        cellElement.style.borderColor = "#f20000";
        setTimeout(() => {
          cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
        }, step);
      }
      //left value
      else if (
        j === highlightRow &&
        k == data[0][highlightColumn] - data[j][0] &&
        j != 1 &&
        k != 0
      ) {
        cellElement.style.borderColor = "#f20000";
        setTimeout(() => {
          cellElement.style.borderColor = "rgba(0, 0, 0, 0)";
        }, step);
      }

      //values display

      const value = data[j][k] === Infinity ? "-" : data[j][k];

      //first column
      if (k == 0) cellElement.textContent = value;
      //previuos row
      else if (j < highlightRow) cellElement.textContent = value;
      //previous values, same row
      else if (j === highlightRow && k < highlightColumn)
        cellElement.textContent = value;
      //rest hidden
      else if (j != highlightRow || k != highlightColumn)
        cellElement.textContent = "";
      setTimeout(() => {
        if (j === highlightRow && k === highlightColumn)
          cellElement.textContent = value;
      }, step);
    }
  }

  container.innerHTML = "";
  container.appendChild(table);
}

function findCoinsUsed(table) {
  let i = table.length - 1;
  let j = table[0].length - 1;

  const coinsUsed = [];

  while (j != 0) {
    while (table[i][j] == table[i - 1][j]) {
      i--;
    }
    coinsUsed.push(table[i][0]);
    // console.log(coinsUsed);
    j -= table[i][0];
  }

  return coinsUsed;
}

function displayTableBack(
  coinIndex,
  container,
  data,
  highlightRow,
  highlightColumn
) {
  const table = document.createElement("table");
  const header = table.createTHead();
  const body = table.createTBody();

  // Create header row
  const headerRow = header.insertRow();
  headerRow.insertCell().textContent = "Coins";

  for (let i = 1; i < data[0].length; i++) {
    headerRow.insertCell().textContent = `Sum ${i}`;
  }

  // Create data rows
  for (let j = 1; j < data.length; j++) {
    const dataRow = body.insertRow();
    for (let k = 0; k < data[j].length; k++) {
      const cellElement = dataRow.insertCell();

      //highlight border
      //on that cell
      if (highlightColumn === k && k === 0 && coinIndex.includes(j))
        cellElement.style.borderColor = "#f20000";
      else if (j === highlightRow && k === highlightColumn)
        cellElement.style.borderColor = "#f20000";
      //above cell
      else if (j === highlightRow - 1 && k === highlightColumn && k != 0)
        cellElement.style.borderColor = "#f20000";
      //this coin was used
      else if (
        j === highlightRow &&
        k === 0 &&
        data[highlightRow][highlightColumn] !=
          data[highlightRow - 1][highlightColumn]
      )
        cellElement.style.borderColor = "#f20000";
      // console.log(highlightColumn);
      //values display
      const value = data[j][k] === Infinity ? "-" : data[j][k];
      cellElement.textContent = value;
    }
  }

  container.innerHTML = "";
  container.appendChild(table);
}

function displayBacktracking(coinsUsed, table, result, step, i, j) {
  backtrackRunning = true;

  const outputDiv = document.getElementById("output");
  const explainDiv = document.getElementById("explain");
  const tableContainer = document.getElementById("table-container");

  if (iBacktrack == table.length - 1 && jBacktrack == table[0].length - 1) {
    outputDiv.innerHTML = "Backtracking";
    explainDiv.innerHTML = "Finding which coins were used";
  }

  const coinIndex = [];
  for (let k = 0; k < table.length; k++) {
    if (coinsUsed.includes(table[k][0])) coinIndex.push(k);
  }
  // console.log(coinIndex);
  backtrackInterval = setInterval(() => {
    displayTableBack(coinIndex, tableContainer, table, i, j);
    if (i === 0 || j === 0) {
      outputDiv.innerHTML = `Therefore, ${
        table[table.length - 1][table[0].length - 1]
      } coins have been used.`;
      explainDiv.innerHTML = `Combination of coins is (${coinsUsed.reverse()}).`;
      console.log("Dynamic simulation complete.");
      displayTableBack(coinIndex, tableContainer, table, i, j);
      backtrackRunning = false;
      iBacktrack = table.length - 1;
      jBacktrack = table[0].length - 1;
      btnPause.style.display = "none";
      btnDynamic.style.display = "block";
      btnGreedy.style.display = "block";
      clearInterval(backtrackInterval);
      // step = 1;
    } else {
      if (table[i][j] === table[i - 1][j]) {
        i--;
        iBacktrack--;
        outputDiv.innerHTML = `Sum remaining =  ${j}.`;
        explainDiv.innerHTML = `Upper value is same, move up.`;
      } else {
        // coinsUsed.push(table[i][0]);
        j -= table[i][0];
        jBacktrack -= table[i][0];
        outputDiv.innerHTML = `Sum remaining = Sum - Coin = ${j}.`;
        explainDiv.innerHTML = `No. of coins decreased when coin ${table[i][0]} was used, add it in solution.`;
      }
    }
  }, step * 1000);
}

function runGreedy() {
  if (dynamicRunning || greedyRunning || backtrackRunning) {
    // window.alert('Simulation already running. Please wait or end the Simulation.');
    return;
  }

  const coinsInput = document.getElementById("coins").value;
  const amount = parseInt(document.getElementById("amount").value);

  if (isNaN(amount)) {
    window.alert("Enter Amount");
    return;
  }
  if (isNaN(parseFloat(coinsInput))) {
    window.alert("Enter Coins");
    return;
  }

  btnPause.style.display = "block";
  btnDynamic.style.display = "none";
  btnGreedy.style.display = "none";

  greedyRunning = true;
  step = 0;

  let coins = coinsInput.split(" ").map((coin) => parseInt(coin));
  tempAmount = amount;

  const { result, coinSet } = coinChangeGreedy(coins, amount);

  displaySimulationGreedy(amount, coins, result, coinSet, 0);
}

function coinChangeGreedy(coins, amount) {
  let coinSet = [];
  let i = coins.length - 1;
  while (amount != 0) {
    if (amount >= coins[i]) {
      amount -= coins[i];
      coinSet.push(coins[i]);
    } else i--;
  }
  return { result: amount != 0 ? -1 : coinSet.length, coinSet };
}

function displaySimulationGreedy(amount, coins, result, coinSet, i) {
  const outputDiv = document.getElementById("output");
  const explainDiv = document.getElementById("explain");
  const tableContainer = document.getElementById("table-container");

  const table = document.createElement("table");
  const coinsSorted = coins.slice().sort((a, b) => b - a);
  if (result === -1) {
    outputDiv.innerHTML = "No valid combination.";
    return;
  } else {
    if (i == 0) {
      outputDiv.innerHTML = "Coins Given";
      explainDiv.innerHTML = `Sum = ${amount}`;
      tableContainer.innerHTML = "";
      table, (step = displayUnsorted(coins, table, tableContainer, step));
      iGreedy++;
      i++;
    }

    if (i == 1) {
      setTimeout(() => {
        table.deleteRow(0);
        const sorted = table.insertRow();
        for (coin of coinsSorted) {
          const cellElement = sorted.insertCell();
          cellElement.textContent = coin;
        }
        outputDiv.innerHTML = "Sort from highest to lowest";
        tableContainer.innerHTML = "";
        tableContainer.appendChild(table);
      }, step * 1000);
      step += 1;
      iGreedy++;
      i++;
    }

    if (i >= 2) {
      i = i - 2;
      greedyInterval = setInterval(() => {
        displayRow(tableContainer, coinsSorted, i, table, amount, coinSet);
        if (amount === 0 && tempAmount === 0) {
          outputDiv.innerHTML = `Therefore, ${result} coins have been used.`;
          explainDiv.innerHTML = `Combination of coins is (${coinSet}).`;
          console.log("Greedy simulation complete.");
          greedyRunning = false;
          wasPausedGreedy = false;
          iGreedy = 0;
          played = 0;
          i = 0;
          step = 0;
          btnPause.style.display = "none";
          btnDynamic.style.display = "block";
          btnGreedy.style.display = "block";
          clearInterval(greedyInterval);
        } else {
          if (amount >= coinsSorted[i]) {
            outputDiv.innerHTML = `Take coin ${coinsSorted[i]}.`;
            explainDiv.innerHTML = `Sum left = ${amount - coinsSorted[i]}`;
            amount -= coinsSorted[i];
            tempAmount -= coinsSorted[i];
          } else {
            iGreedy++;
            i++;
            outputDiv.innerHTML = `Denomination greater than sum. Move to next`;
            explainDiv.innerHTML = `Sum left = ${amount}`;
          }
        }
      }, step * 1000);
      // return step;
    }
  }
}

function displayUnsorted(coins, table, container, step) {
  const unsorted = table.insertRow();
  for (coin of coins) {
    const cellElement = unsorted.insertCell();
    cellElement.textContent = coin;
    console.log(coins);
  }
  container.innerHTML = "";
  setTimeout(() => {
    container.appendChild(table);
  }, step * 1000);
  step += 1;

  return table, step;
}

function displayRow(tableContainer, coinsSorted, i, table, amount, coinSet) {
  const row = table.insertRow();

  if (!wasPausedGreedy || played > 1 || wasPaused) {
    table.deleteRow(0);
  }

  for (let j = 0; j < coinsSorted.length; j++) {
    const cellElement = row.insertCell();
    cellElement.textContent = coinsSorted[j];
    if (i === j) cellElement.style.borderColor = "#f20000";
    if (amount === 0 && coinSet.includes(coinsSorted[j]))
      cellElement.style.borderColor = "#f20000";
  }
  tableContainer.innerHTML = "";
  tableContainer.appendChild(table);
  played++;
}
