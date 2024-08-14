let addedButton = false;
let observer = null;
let selectedTxnsCheckboxesArray = [];

function addSplitButton() {
  // Select the node that will be observed for mutations
  const targetNode = document.querySelector("div#registerList");
  if (!targetNode) {
    //The node we need does not exist yet.
    //Wait 500ms and try again
    console.log("Target Node Not Found");
    window.setTimeout(addSplitButton, 500);
    return;
  }
  console.log("Target Node Found", targetNode);

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        console.log("A child node attributes have changed.");
        const selectedTxnsCheckboxes = document.querySelectorAll(
          'div#registerList span[class*="Mui-checked"]'
        );
        selectedTxnsCheckboxesArray = Array.from(selectedTxnsCheckboxes);

        if (selectedTxnsCheckboxesArray.length > 0) {
          console.log("Multiple Txns Selected:", selectedTxnsCheckboxesArray);
          const targetToolbar = document.querySelector(
            'div[class*="growableArea"]'
          );
          console.log("Target header found:", targetToolbar);

          if (targetToolbar && !addedButton) {
            const button = document.createElement("button");
            button.id = "split-txns";
            button.textContent = "S";
            button.style.border = "none";
            button.style.fontSize = "1.5em";
            button.style.fontWeight = "bold";
            button.style.width = "38px";
            button.style.height = "38px";
            button.style.backgroundColor = "white";
            button.style.color = "#617179";
            button.style.cursor = "pointer";

            button.onclick = function () {
              splitSelectedTransactions();
            };

            const divider = document.createElement("hr");
            divider.className =
              "sc-ctqQKy kaFCbK MuiDivider-root MuiDivider-middle MuiDivider-vertical MuiDivider-flexItem";
            divider.id = "split-txns-divider";
            targetToolbar.appendChild(divider);
            targetToolbar.appendChild(button);
            addedButton = true;
          } else {
            console.log("Toolbar not found.");
          }
        } else {
          console.log("No Txns Selected");
          removeSplitButton();
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}

function removeSplitButton() {
  const splitButton = document.querySelector("button#split-txns");
  const divider = document.querySelector("hr#split-txns-divider");
  if (splitButton || divider) {
    splitButton.remove();
    divider.remove();
    addedButton = false;
  }
}

const sleepUntil = async (f, timeoutMs) => {
  return new Promise((resolve, reject) => {
    const timeWas = new Date();
    const wait = setInterval(function () {
      if (f()) {
        console.log("resolved after", new Date() - timeWas, "ms");
        clearInterval(wait);
        resolve();
      } else if (new Date() - timeWas > timeoutMs) {
        // Timeout
        console.log("rejected after", new Date() - timeWas, "ms");
        clearInterval(wait);
        reject();
      }
    }, 20);
  });
};

async function splitSelectedTransactions() {
  let currentTxn = selectedTxnsCheckboxesArray.length;
  while (currentTxn--) {
    const txnCheckbox = selectedTxnsCheckboxesArray[currentTxn];
    // Click the View Transaction
    const registerRow = txnCheckbox.parentElement;
    registerRow.querySelector("button#txnMenu").click();

    await sleepUntil(() => document.querySelector("li#txn-menu-edit"));
    document.querySelector("li#txn-menu-edit").click();

    // From the Transaction Detail Dialog

    // Open the Split Dialog
    await sleepUntil(() => document.querySelector("button#split-button"));
    document.querySelector("button#split-button").click();

    // Add another category Split
    await sleepUntil(() =>
      document.querySelector(
        'div[role="dialog"] div[class*="bottomButtons"] button'
      )
    );
    document
      .querySelector('div[role="dialog"] div[class*="bottomButtons"] button')
      .click();

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      keyCode: 13,
      which: 13,
    });

    // Update first category
    // Select the Input
    await sleepUntil(() => document.querySelector("input#split-cat-1-input"));
    document.querySelector("input#split-cat-1-input").click();

    // Hit enter to select any category
    await setTimeout(() => {}, 1000);
    document.querySelector("input#split-cat-1-input").dispatchEvent(enterEvent);

    // Update the category that we need
    await setTimeout(() => {}, 1000);
    document.querySelector("input#split-cat-1-input").value = "Kids Supplies";

    // Update second category
    // Select the Input
    await sleepUntil(() => document.querySelector("input#split-cat-2-input"));
    document.querySelector("input#split-cat-2-input").click();

    // Hit enter to select any category
    await setTimeout(() => {}, 1000);
    document.querySelector("input#split-cat-2-input").dispatchEvent(enterEvent);

    // Update the category that we need
    await setTimeout(() => {}, 1000);
    document.querySelector("input#split-cat-2-input").value =
      "Personal Supplies";

    // Access the triple dot Millennium
    await sleepUntil(() => document.querySelector("button#split-evenly"));
    document.querySelector("button#split-evenly").click();

    // Divide the ammount evenly
    await sleepUntil(() => document.querySelector("li#menu-split"));
    document.querySelector("li#menu-split").click();

    // Save the Splits
    await sleepUntil(() =>
      document.querySelector(
        'div[role="dialog"] div[class*="actions"] button:last-child'
      )
    );
    document
      .querySelector(
        'div[role="dialog"] div[class*="actions"] button:last-child'
      )
      .click();

    // Click Update on Transaction Details
    await sleepUntil(() => document.querySelector("button#save-txn"));
    document.querySelector("button#save-txn").click();

    console.log("Transaction Split Successfully");
    console.log("Current Txn", currentTxn);
    console.log("Remaining Txns", selectedTxnsCheckboxesArray.length);
    selectedTxnsCheckboxesArray.splice(currentTxn, 1);
  }
}

// Listen for location changes
window.navigation.addEventListener("navigate", (event) => {
  const url = event.destination.url;
  console.log("location changed!");
  if (url.match("transactions") && !addedButton) {
    console.log("Transactions page found!");
    addSplitButton();
  } else {
    console.log("Stopping Observer");
    observer.disconnect();
  }
});

console.log("Content Script Loaded");

// If we are already on transactions page, add the button
if (window.location.href.match("transactions") && !addedButton) {
  console.log("Transactions page found!");
  addSplitButton();
}
