function addExtractButton() {
  let foundPatientCard = false;
  // Select the node that will be observed for mutations
  const targetNode = document.getElementById("__next");

  // Options for the observer (which mutations to observe)
  const config = { childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList" && !foundPatientCard) {
        console.debug("A child node has been added or removed.");
        const cardHeaders = document.querySelectorAll(".card-header");
        if (cardHeaders.length > 0) {
          console.debug("Card headers found:", cardHeaders);
          const targetHeader = Array.from(cardHeaders).find((header) =>
            header.textContent.includes("Patient")
          );
          console.debug("Target header found:", targetHeader);

          if (targetHeader) {
            foundPatientCard = true;
            const button = document.createElement("button");
            button.textContent = "Extract";
            button.style.border = "1px solid";
            button.style.backgroundColor = "white";
            button.style.color = "#0a4a73";
            button.style.borderRadius = "20px";
            button.style.cursor = "pointer";
            button.style.padding = "5px 10px";

            button.onclick = function () {
              let patientData = {};
              const styledRowData = targetHeader.parentElement
                .querySelector(
                  ".card-header ~ .card-body [class^=StyledTableBody]"
                )
                .querySelectorAll("[class^=StyledTableRow]");
              Array.from(styledRowData).forEach((row) => {
                const cells = row.querySelectorAll("[class^=StyledTableCell]");
                patientData[cells[0].textContent] = cells[1].textContent;
              });
              console.debug("Patient data extracted:", patientData);
              // Example of sending data from a content script
              chrome.runtime.sendMessage({
                type: "EXTRACT_PATIENT",
                payload: patientData,
              });
            };

            targetHeader.appendChild(button);

            // Stop observing the target node
            observer.disconnect();
          } else {
            console.debug(
              'No card-header with text "Patient" found on this page.'
            );
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

window.navigation.addEventListener("navigate", (event) => {
  const url = event.destination.url;
  console.debug("location changed!");
  if (url.match("central-fill/[0-9]+")) {
    console.debug("Patient page found!");
    addExtractButton();
  }
});
