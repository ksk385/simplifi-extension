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

        if (selectedTxnsCheckboxes.length > 0) {
          console.log("Multiple Txns Selected:", selectedTxnsCheckboxes);
          const targetToolbar = document.querySelector(
            'div[class*="optionalIconSpace"]'
          );
          console.log("Target header found:", targetToolbar);

          if (targetToolbar) {
            multipleTxnsSelected = true;
            const button = document.createElement("button");
            button.textContent = "Split";
            button.style.border = "1px solid";
            button.style.backgroundColor = "white";
            button.style.color = "#0a4a73";
            button.style.borderRadius = "20px";
            button.style.cursor = "pointer";
            button.style.padding = "5px 10px";

            button.onclick = function () {
              splitSelectedTransactions(selectedTxnsCheckboxes);
            };

            targetToolbar.appendChild(button);

            // Stop observing the target node
            observer.disconnect();
          } else {
            console.log("Toolbar not found.");
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
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

async function splitSelectedTransactions(selectedTxnsCheckboxes) {
  for (txnCheckbox of selectedTxnsCheckboxes) {
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
      document.querySelector('div[role="dialog"] div[class*="bottom"] button')
    );
    document
      .querySelector('div[role="dialog"] div[class*="bottom"] button')
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
    document.querySelector("input#split-cat-1-input").dispatchEvent(enterEvent);

    // Update the category that we need
    document.querySelector("input#split-cat-1-input").value = "Kids Supplies";

    // Update second category
    // Select the Input
    await sleepUntil(() => document.querySelector("input#split-cat-2-input"));
    document.querySelector("input#split-cat-2-input").click();

    // Hit enter to select any category

    document.querySelector("input#split-cat-2-input").dispatchEvent(enterEvent);

    // Update the category that we need
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
  }
}

// Listen for location changes
window.navigation.addEventListener("navigate", (event) => {
  const url = event.destination.url;
  console.log("location changed!");
  if (url.match("transactions")) {
    console.log("Transactions page found!");
    addSplitButton();
  }
});

console.log("Content Script Loaded");

// If we are already on transactions page, add the button
if (window.location.href.match("transactions")) {
  console.log("Transactions page found!");
  addSplitButton();
}
