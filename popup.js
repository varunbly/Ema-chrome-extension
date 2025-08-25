const subjectsList = document.getElementById("subjects");

// Ask background to inject content.js
chrome.runtime.sendMessage("injectContentScript", (response) => {
    if (response === "injected") {
        // Once injected, request subjects from Gmail page
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, "getSubjects", (subjects) => {
                if (subjects && subjects.length > 0) {
                    subjects.forEach(sub => {
                        const li = document.createElement("li");
                        li.textContent = sub;
                        subjectsList.appendChild(li);
                    });
                } else {
                    subjectsList.innerHTML = "<li>No subjects found.</li>";
                }
            });
        });
    } else if (response === "notGmail") {
        subjectsList.innerHTML = "<li>Open Gmail to view subjects.</li>";
    }
});
