// public/script.js

const promptInput = document.getElementById("prompt");
const askButton = document.getElementById("askButton");
const buttonText = document.getElementById("buttonText");
const spinner = document.getElementById("spinner");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");

const characterCount = document.getElementById("characterCount");
const validationMessage = document.getElementById("validationMessage");

const responseSection = document.getElementById("responseSection");
const responseElement = document.getElementById("response");

const errorCard = document.getElementById("errorCard");
const errorText = document.getElementById("errorText");

const quickButtons = document.querySelectorAll(".quick-button");

function updateCharacterCount() {
  characterCount.textContent = `${promptInput.value.length} / 5000`;
}

function showValidation(message) {
  validationMessage.textContent = message;
  validationMessage.classList.remove("hidden");
}

function hideValidation() {
  validationMessage.textContent = "";
  validationMessage.classList.add("hidden");
}

function showError(message) {
  errorText.textContent = message;
  errorCard.classList.remove("hidden");
}

function hideError() {
  errorText.textContent = "";
  errorCard.classList.add("hidden");
}

function setLoading(isLoading) {
  askButton.disabled = isLoading;
  promptInput.disabled = isLoading;
  clearButton.disabled = isLoading;

  if (isLoading) {
    buttonText.textContent = "Thinking...";
    spinner.classList.remove("hidden");
  } else {
    buttonText.textContent = "Ask AI";
    spinner.classList.add("hidden");
  }
}

async function askAI() {
  const prompt = promptInput.value.trim();

  hideValidation();
  hideError();

  if (!prompt) {
    showValidation("Please enter a question or study prompt.");
    promptInput.focus();
    return;
  }

  if (prompt.length < 3) {
    showValidation("Please enter at least 3 characters.");
    promptInput.focus();
    return;
  }

  if (prompt.length > 5000) {
    showValidation("Your prompt must be 5000 characters or fewer.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/study", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(
        data.error || "The AI request could not be completed."
      );
    }

    if (!data.answer || !data.answer.trim()) {
      throw new Error(
        "The AI returned an empty response. Please try again."
      );
    }

    responseElement.textContent = data.answer;
    responseSection.classList.remove("hidden");

    responseSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (error) {
    showError(
      error.message ||
      "Something went wrong. Please check your connection and try again."
    );
  } finally {
    setLoading(false);
  }
}

askButton.addEventListener("click", askAI);

promptInput.addEventListener("input", () => {
  updateCharacterCount();
  hideValidation();
});

promptInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    askAI();
  }
});

clearButton.addEventListener("click", () => {
  promptInput.value = "";
  responseElement.textContent = "";

  updateCharacterCount();
  hideValidation();
  hideError();

  responseSection.classList.add("hidden");

  promptInput.focus();
});

copyButton.addEventListener("click", async () => {
  const text = responseElement.textContent.trim();

  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);

    const originalText = copyButton.textContent;
    copyButton.textContent = "Copied!";

    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 1500);
  } catch {
    showError("Unable to copy the response.");
  }
});

quickButtons.forEach((button) => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt;

    updateCharacterCount();
    hideValidation();
    hideError();

    promptInput.focus();

    promptInput.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });
});

updateCharacterCount();