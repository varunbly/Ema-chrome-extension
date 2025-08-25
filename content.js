console.log("Content script loaded on Gmail");

function getSubjects() {
    const subjects = [];
    const subjectElements = document.querySelectorAll("span.bog");
    subjectElements.forEach(el => subjects.push(el.innerText));
    return subjects;
}

// Listen for requests from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg === "getSubjects") {
        sendResponse(getSubjects());
    }
});


getSubjects();