const leftInput = document.querySelector("#leftInput");
const rightInput = document.querySelector("#rightInput");
const compareMode = document.querySelector("#compareMode");
const filterSelect = document.querySelector("#filterSelect");
const strictValues = document.querySelector("#strictValues");
const ignoreKeyOrder = document.querySelector("#ignoreKeyOrder");
const includeEqual = document.querySelector("#includeEqual");
const openLeftButton = document.querySelector("#openLeftButton");
const openRightButton = document.querySelector("#openRightButton");
const leftFileInput = document.querySelector("#leftFileInput");
const rightFileInput = document.querySelector("#rightFileInput");
const compareButton = document.querySelector("#compareButton");
const copyButton = document.querySelector("#copyButton");
const saveButton = document.querySelector("#saveButton");
const clearButton = document.querySelector("#clearButton");
const status = document.querySelector("#status");
const stats = document.querySelector("#stats");
const leftCount = document.querySelector("#leftCount");
const rightCount = document.querySelector("#rightCount");
const resultCount = document.querySelector("#resultCount");
const diffRows = document.querySelector("#diffRows");
const addedCount = document.querySelector("#addedCount");
const removedCount = document.querySelector("#removedCount");
const changedCount = document.querySelector("#changedCount");
const equalCount = document.querySelector("#equalCount");
const releaseStamp = document.querySelector("#releaseStamp");

const appRelease = "20260609-2341";

const sampleLeft = {
  project: "Compare Lizard",
  release: 1,
  active: true,
  tags: ["json", "diff", "lizard"],
  owner: {
    name: "Ada",
    role: "formatter"
  },
  limits: {
    maxDepth: 8,
    strict: true
  }
};

const sampleRight = {
  project: "Compare Lizard",
  release: 2,
  active: true,
  tags: ["json", "compare", "lizard"],
  owner: {
    name: "Ada",
    role: "reviewer"
  },
  limits: {
    maxDepth: 8,
    strict: false
  },
  output: "report"
};

let currentDiffs = [];

leftInput.value = JSON.stringify(sampleLeft, null, 2);
rightInput.value = JSON.stringify(sampleRight, null, 2);
renderReleaseStamp();
compareJson();

openLeftButton.addEventListener("click", () => leftFileInput.click());
openRightButton.addEventListener("click", () => rightFileInput.click());
leftFileInput.addEventListener("change", () => openSelectedFile(leftFileInput, leftInput, "left"));
rightFileInput.addEventListener("change", () => openSelectedFile(rightFileInput, rightInput, "right"));
compareButton.addEventListener("click", compareJson);
copyButton.addEventListener("click", copyDiffReport);
saveButton.addEventListener("click", saveDiffReport);
clearButton.addEventListener("click", clearAll);
leftInput.addEventListener("input", handleEditorInput);
rightInput.addEventListener("input", handleEditorInput);
compareMode.addEventListener("change", compareJson);
strictValues.addEventListener("change", compareJson);
ignoreKeyOrder.addEventListener("change", compareJson);
includeEqual.addEventListener("change", compareJson);
filterSelect.addEventListener("change", renderDiffs);

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    filterSelect.value = button.dataset.filter;
    renderDiffs();
  });
});

function handleEditorInput() {
  updateCounts();
  setStatus("Ready", "idle");
}

async function openSelectedFile(input, target, side) {
  const [file] = input.files;
  input.value = "";

  if (!file) {
    return;
  }

  try {
    target.value = await file.text();
    updateCounts();
    compareJson();
    setStatus(`Opened ${file.name} on ${side}`, "valid");
  } catch {
    setStatus("Could not open file", "error");
  }
}

function compareJson() {
  let left;
  let right;

  try {
    left = JSON.parse(leftInput.value);
  } catch (error) {
    setStatus(`Left JSON: ${error.message}`, "error");
    currentDiffs = [];
    renderDiffs();
    updateCounts();
    return;
  }

  try {
    right = JSON.parse(rightInput.value);
  } catch (error) {
    setStatus(`Right JSON: ${error.message}`, "error");
    currentDiffs = [];
    renderDiffs();
    updateCounts();
    return;
  }

  currentDiffs = compareValues(left, right, "$");

  if (!includeEqual.checked) {
    currentDiffs = currentDiffs.filter((row) => row.type !== "equal");
  }

  renderDiffs();
  updateCounts();

  const summary = getSummary(currentDiffs);
  const differenceCount = summary.added + summary.removed + summary.changed;
  setStatus(differenceCount ? `Found ${differenceCount} differences` : "Documents match", "valid");
}

function compareValues(left, right, path) {
  const leftType = getType(left);
  const rightType = getType(right);

  if (compareMode.value === "values" && leftType !== "object" && leftType !== "array" && rightType !== "object" && rightType !== "array") {
    return makeLeafDiff(left, right, path);
  }

  if (leftType !== rightType) {
    return [makeDiff("changed", path, left, right)];
  }

  if (leftType === "object") {
    return compareObjects(left, right, path);
  }

  if (leftType === "array") {
    return compareArrays(left, right, path);
  }

  return makeLeafDiff(left, right, path);
}

function compareObjects(left, right, path) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  const keys = Array.from(new Set([...leftKeys, ...rightKeys]));

  if (ignoreKeyOrder.checked) {
    keys.sort((a, b) => a.localeCompare(b));
  }

  return keys.flatMap((key) => {
    const childPath = `${path}.${escapePathKey(key)}`;

    if (!Object.hasOwn(left, key)) {
      return [makeDiff("added", childPath, undefined, right[key])];
    }

    if (!Object.hasOwn(right, key)) {
      return [makeDiff("removed", childPath, left[key], undefined)];
    }

    return compareValues(left[key], right[key], childPath);
  });
}

function compareArrays(left, right, path) {
  const length = Math.max(left.length, right.length);
  const rows = [];

  for (let index = 0; index < length; index += 1) {
    const childPath = `${path}[${index}]`;

    if (index >= left.length) {
      rows.push(makeDiff("added", childPath, undefined, right[index]));
    } else if (index >= right.length) {
      rows.push(makeDiff("removed", childPath, left[index], undefined));
    } else {
      rows.push(...compareValues(left[index], right[index], childPath));
    }
  }

  return rows;
}

function makeLeafDiff(left, right, path) {
  if (valuesMatch(left, right)) {
    return includeEqual.checked ? [makeDiff("equal", path, left, right)] : [];
  }

  return [makeDiff("changed", path, left, right)];
}

function valuesMatch(left, right) {
  if (strictValues.checked) {
    return Object.is(left, right);
  }

  return String(left) === String(right);
}

function makeDiff(type, path, left, right) {
  return {
    type,
    path,
    left,
    right
  };
}

function renderDiffs() {
  const filter = filterSelect.value;
  const rows = currentDiffs.filter((row) => filter === "all" || row.type === filter);
  diffRows.textContent = "";

  if (!rows.length) {
    const empty = document.createElement("div");
    empty.className = "empty-results";
    empty.textContent = currentDiffs.length ? "No rows match that filter." : "No comparison rows yet.";
    diffRows.append(empty);
  } else {
    const fragment = document.createDocumentFragment();

    rows.forEach((row) => {
      const element = document.createElement("div");
      element.className = `diff-row diff-row-${row.type}`;
      element.setAttribute("role", "row");
      element.append(
        makeCell(row.path, "Path"),
        makeTypeCell(row.type),
        makeCell(formatValue(row.left), "Left"),
        makeCell(formatValue(row.right), "Right")
      );
      fragment.append(element);
    });

    diffRows.append(fragment);
  }

  const summary = getSummary(currentDiffs);
  addedCount.textContent = summary.added;
  removedCount.textContent = summary.removed;
  changedCount.textContent = summary.changed;
  equalCount.textContent = summary.equal;
  resultCount.textContent = `${rows.length} ${rows.length === 1 ? "row" : "rows"}`;
  stats.textContent = `${summary.added} added · ${summary.removed} removed · ${summary.changed} changed`;
}

function makeCell(value, label) {
  const cell = document.createElement("span");
  cell.setAttribute("role", "cell");
  cell.dataset.label = label;
  cell.textContent = value;
  return cell;
}

function makeTypeCell(type) {
  const cell = document.createElement("span");
  const mark = document.createElement("mark");
  cell.setAttribute("role", "cell");
  cell.dataset.label = "Type";
  mark.textContent = type;
  cell.append(mark);
  return cell;
}

function getSummary(rows) {
  return rows.reduce(
    (summary, row) => {
      summary[row.type] += 1;
      return summary;
    },
    { added: 0, removed: 0, changed: 0, equal: 0 }
  );
}

function formatValue(value) {
  if (value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}

function getType(value) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function escapePathKey(key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

async function copyDiffReport() {
  const report = JSON.stringify(buildReport(), null, 2);

  try {
    if (!navigator.clipboard) {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(report);
    setStatus("Copied diff report", "valid");
  } catch {
    if (copyTextFallback(report)) {
      setStatus("Copied diff report", "valid");
    } else {
      setStatus("Could not copy report", "error");
    }
  }
}

function copyTextFallback(text) {
  const scratch = document.createElement("textarea");
  scratch.value = text;
  scratch.setAttribute("readonly", "");
  scratch.style.position = "fixed";
  scratch.style.inset = "0 auto auto 0";
  scratch.style.opacity = "0";
  document.body.append(scratch);
  scratch.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    scratch.remove();
  }
}

function saveDiffReport() {
  const blob = new Blob([JSON.stringify(buildReport(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "compare-lizard-diff.json";
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Saved diff report", "valid");
}

function buildReport() {
  return {
    app: "Compare Lizard",
    release: appRelease,
    options: {
      mode: compareMode.value,
      strictValues: strictValues.checked,
      ignoreObjectKeyOrder: ignoreKeyOrder.checked,
      includeEqualPaths: includeEqual.checked
    },
    summary: getSummary(currentDiffs),
    rows: currentDiffs
  };
}

function clearAll() {
  leftInput.value = "";
  rightInput.value = "";
  currentDiffs = [];
  renderDiffs();
  updateCounts();
  setStatus("Ready", "idle");
}

function setStatus(message, type) {
  status.textContent = message;
  status.className = `status-pill status-${type}`;
}

function updateCounts() {
  leftCount.textContent = `${leftInput.value.length} chars`;
  rightCount.textContent = `${rightInput.value.length} chars`;
}

function renderReleaseStamp() {
  releaseStamp.textContent = `Version: ${appRelease}`;
}
