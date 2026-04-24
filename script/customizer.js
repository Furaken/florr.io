// ==UserScript==
// @name         florr.io | Florr Customizer
// @namespace    https://github.com/Furaken/florr.io/blob/main/script/customizer.js
// @version      2.1.5
// @description  Redecorate florr.io with your style.
// @author       Furaken
// @match        https://florr.io/*
// @license      AGPL3
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

const version = "2.1.5";

function addAlpha(color, opacity) {
    opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
    return color + opacity.toString(16).toUpperCase().padStart(2, '0');
}
function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function fmtAlpha(a) { return a === "*" ? "*" : Number(a).toFixed(2); }
function pickColor(current) {
    return new Promise(resolve => {
        let inp = document.createElement("input");
        inp.type = "color";
        inp.value = /^#[A-Fa-f0-9]{6}$/.test(current) ? current : "#000000";
        inp.style = "position:fixed;opacity:0;pointer-events:none;";
        document.body.appendChild(inp);
        let picked = false;
        inp.oninput = () => { picked = true; };
        inp.onchange = () => { document.body.removeChild(inp); resolve(inp.value); };
        inp.addEventListener("blur", () => { setTimeout(() => { if (!picked) { document.body.removeChild(inp); resolve(null); } }, 200); });
        inp.click();
    });
}
function createEle(type, parent, style, innerHTML, id, className) {
    let ele = document.createElement(type);
    if (style) ele.style = style;
    if (innerHTML != null) ele.innerHTML = innerHTML;
    if (id) ele.id = id;
    if (className) ele.className = className;
    if (parent) parent.appendChild(ele);
    return ele;
}

let ls = localStorage.customizer || JSON.stringify({
    color: { from: [], to: [] },
    text: [],
});

function errorMessage(error) {
    console.error(error);
    alert(`${error}\n\n${JSON.stringify(ls, null, 4)}`);
}

try { ls = JSON.parse(ls); } catch (error) { errorMessage(error); }
if (!ls.color) ls.color = { from: [], to: [] };
if (!ls.text) ls.text = [];

function saveLS() { localStorage.customizer = JSON.stringify(ls); }

var animatedObj = [];

let _mainCtx = null;
function getMainCtx() {
    if (!_mainCtx) {
        const c = document.getElementById("canvas");
        if (c) _mainCtx = c.getContext("2d");
    }
    return _mainCtx;
}
Object.defineProperty(window, 'mainCtx', { get: getMainCtx });

function convertColor(this_, x0, y0, x1, y1, isStroke) {
    try {
        ls.color.from.forEach((obj, index) => {
            if (obj.enabled === false) return;
            let outputColor = isStroke ? this_.strokeStyle : this_.fillStyle;
            if (outputColor != obj.color) return;
            if (obj.alpha != "*" && obj.alpha != this_.globalAlpha) return;
            let thisObj = ls.color.to[index].data;
            if (ls.color.to[index].type == "solid") {
                outputColor = thisObj;
            } else if (ls.color.to[index].type == "linear") {
                x0 = x0 || thisObj.pos.x0 || 0;
                y0 = y0 || thisObj.pos.y0 || 0;
                x1 = x1 || thisObj.pos.x1 || x0 + thisObj.pos.defaultEnd.x;
                y1 = y1 || thisObj.pos.y1 || y0 + thisObj.pos.defaultEnd.y;
                outputColor = mainCtx.createLinearGradient(x0, y0, x1, y1);
                thisObj.colorStop.forEach(x => outputColor.addColorStop(x.offset, x.color));
            } else if (ls.color.to[index].type == "radial") {
                let r0, r1;
                x0 = x0 || thisObj.pos.x0 || (x1 == null ? x0 : x1 - (x1 - x0));
                y0 = y0 || thisObj.pos.y0 || (y1 == null ? y0 : y1 - (y1 - y0));
                r0 = r0 || thisObj.pos.r0 || 0;
                x1 = x1 || thisObj.pos.x1 || x0 + thisObj.pos.defaultEnd.x;
                y1 = y1 || thisObj.pos.y1 || y0 + thisObj.pos.defaultEnd.y;
                r1 = r1 || thisObj.pos.r1 || r0 + thisObj.pos.defaultEnd.r;
                outputColor = mainCtx.createRadialGradient(x0, y0, r0, x1, y1, r1);
                thisObj.colorStop.forEach(x => outputColor.addColorStop(x.offset, x.color));
            } else if (ls.color.to[index].type == "animated") {
                if (!animatedObj[index]) return;
                if (!animatedObj[index].isTriggered) {
                    animatedObj[index].isTriggered = true;
                    saveLS();
                    animatedObj[index].color = [hexToRgb(thisObj.keyframes[0]).r, hexToRgb(thisObj.keyframes[0]).g, hexToRgb(thisObj.keyframes[0]).b];
                    animatedObj[index].keyFrames = thisObj.keyframes.map(x => [hexToRgb(x).r, hexToRgb(x).g, hexToRgb(x).b]);
                    animatedObj[index].totalFrames = 60 * thisObj.duration;
                    animatedObj[index].currentFrame = 0;
                    (function update() {
                        animatedObj[index].currentFrame = (animatedObj[index].currentFrame + 1) % animatedObj[index].totalFrames;
                        let kfi = animatedObj[index].currentFrame / (animatedObj[index].totalFrames / animatedObj[index].keyFrames.length);
                        let prev = animatedObj[index].keyFrames[Math.floor(kfi) % animatedObj[index].keyFrames.length];
                        let next = animatedObj[index].keyFrames[Math.ceil(kfi) % animatedObj[index].keyFrames.length];
                        let t = kfi - Math.floor(kfi);
                        animatedObj[index].color[0] = Math.floor((next[0] - prev[0]) * t) + prev[0];
                        animatedObj[index].color[1] = Math.floor((next[1] - prev[1]) * t) + prev[1];
                        animatedObj[index].color[2] = Math.floor((next[2] - prev[2]) * t) + prev[2];
                        requestAnimationFrame(update);
                    })();
                }
                outputColor = rgbToHex(animatedObj[index].color[0], animatedObj[index].color[1], animatedObj[index].color[2]);
            }
            if (!isStroke) this_.fillStyle = outputColor;
            else this_.strokeStyle = outputColor;
            if (ls.color.to[index].alpha != "*") this_.globalAlpha = ls.color.to[index].alpha;
        });
    } catch (error) { errorMessage(error); }
}

function convertText(text) {
    ls.text.forEach(t => {
        if (t.enabled === false) return;
        let a = new RegExp(t.from, "g");
        if (a.test(text)) text = text.replace(a, t.to);
    });
    return text;
}

let findColorArr = [], isFindColor = false;
function colorFinder(color, alpha) {
    if (isFindColor && !findColorArr.find(x => x.color === color) && /^#[A-Fa-f0-9]{6}$/g.test(color) && !ls.color.from.find(x => x.color === color))
        findColorArr.push({ color, alpha });
}

for (let ctx of [CanvasRenderingContext2D, OffscreenCanvasRenderingContext2D]) {
    if (ctx.prototype.RarityColorFillText != undefined) break;

    ctx.prototype.RarityColorFillText = ctx.prototype.fillText;
    ctx.prototype.RarityColorStrokeText = ctx.prototype.strokeText;
    ctx.prototype.RarityColorFillRect = ctx.prototype.fillRect;
    ctx.prototype.RarityColorStroke = ctx.prototype.stroke;
    ctx.prototype.RarityColorFill = ctx.prototype.fill;
    ctx.prototype.RarityColorStrokeRect = ctx.prototype.strokeRect;
    ctx.prototype.RarityColorMeasureText = ctx.prototype.measureText;
    ctx.prototype.RarityColorDrawImage = ctx.prototype.drawImage;

    ctx.prototype.fillRect = function (x, y, w, h) {
        colorFinder(this.fillStyle, this.globalAlpha);
        convertColor(this, x, y, x + w, y + h, false);
        return this.RarityColorFillRect(x, y, w, h);
    };
    ctx.prototype.fill = function (path, fillRule) {
        colorFinder(this.fillStyle, this.globalAlpha);
        convertColor(this, null, null, null, null, false);
        return path != null ? this.RarityColorFill(path, fillRule) : this.RarityColorFill(fillRule);
    };
    ctx.prototype.fillText = function (text, x, y) {
        colorFinder(this.fillStyle, this.globalAlpha);
        convertColor(this, x, y, null, null, false);
        return this.RarityColorFillText(convertText(text), x, y);
    };
    ctx.prototype.strokeText = function (text, x, y) {
        colorFinder(this.fillStyle, this.globalAlpha);
        convertColor(this, x, y, null, null, true);
        return this.RarityColorStrokeText(convertText(text), x, y);
    };
    ctx.prototype.stroke = function (path) {
        colorFinder(this.fillStyle, this.globalAlpha);
        convertColor(this, null, null, null, null, true);
        return path != null ? this.RarityColorStroke(path) : this.RarityColorStroke();
    };
    ctx.prototype.strokeRect = function (x, y, w, h) {
        colorFinder(this.fillStyle, this.globalAlpha);
        convertColor(this, x, y, x + w, y + h, true);
        return this.RarityColorStrokeRect(x, y, w, h);
    };
    ctx.prototype.measureText = function (text) {
        return this.RarityColorMeasureText(convertText(text));
    };
    ctx.prototype.drawImage = function (image, ...args) {
        return this.RarityColorDrawImage(image, ...args);
    };
}

let activeTab = 'color';
let selectedColorIndex = -1;
let selectedTextIndex = -1;

const CLOSE_SVG = "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KDTwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIFRyYW5zZm9ybWVkIGJ5OiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbD0iIzAwMDAwMCI+Cg08ZyBpZD0iU1ZHUmVwb19iZ0NhcnJpZXIiIHN0cm9rZS13aWR0aD0iMCIvPgoNPGcgaWQ9IlNWR1JlcG9fdHJhY2VyQ2FycmllciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cg08ZyBpZD0iU1ZHUmVwb19pY29uQ2FycmllciI+Cg08cGF0aCBmaWxsPSIjZmZmZmZmY2MiIGQ9Ik0xOTUuMiAxOTUuMmE2NCA2NCAwIDAgMSA5MC40OTYgMEw1MTIgNDIxLjUwNCA3MzguMzA0IDE5NS4yYTY0IDY0IDAgMCAxIDkwLjQ5NiA5MC40OTZMNjAyLjQ5NiA1MTIgODI4LjggNzM4LjMwNGE2NCA2NCAwIDAgMS05MC40OTYgOTAuNDk2TDUxMiA2MDIuNDk2IDI4NS42OTYgODI4LjhhNjQgNjQgMCAwIDEtOTAuNDk2LTkwLjQ5Nkw0MjEuNTA0IDUxMiAxOTUuMiAyODUuNjk2YTY0IDY0IDAgMCAxIDAtOTAuNDk2eiIvPgoNPC9nPgoNPC9zdmc+";

function getPosition(x_, y_, r_, hasRadius) {
    let string = hasRadius
        ? prompt("x, y, radius", `${x_}, ${y_}, ${r_}`)
        : prompt("x, y", `${x_}, ${y_}`);
    if (string == null) return null;
    let parts = string.split(",");
    if (parts.length < (hasRadius ? 3 : 2)) { alert("Invalid input."); return null; }
    let x = parts[0].trim(), y = parts[1].trim();
    x = (isNaN(x) || x === "") ? null : Number(x);
    y = (isNaN(y) || y === "") ? null : Number(y);
    if (hasRadius) {
        let r = parts[2].trim();
        r = (isNaN(r) || r === "") ? null : Number(r);
        if (r !== null && r < 0) { alert("Radius cannot be less than 0."); return null; }
        return { x, y, r };
    }
    return { x, y };
}

function badge(text, bg, border) {
    return `<span style="display:inline-block;padding:1px 7px;border-radius:4px;background:${bg};border:2px solid ${border};font-size:14px;">${text}</span>`;
}

let container = createEle("div", document.querySelector("body"),
    `margin:0;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(1);
     width:82%;height:82%;display:flex;z-index:9999;
     transition:transform 0.3s ease;
     font-family:"Space Mono",monospace;color:white;
     text-shadow:rgb(0 0 0) 2px 0px 0px, rgb(0 0 0) 1.75517px 0.958851px 0px, rgb(0 0 0) 1.0806px 1.68294px 0px, rgb(0 0 0) 0.141474px 1.99499px 0px, rgb(0 0 0) -0.832294px 1.81859px 0px, rgb(0 0 0) -1.60229px 1.19694px 0px, rgb(0 0 0) -1.97998px 0.28224px 0px, rgb(0 0 0) -1.87291px -0.701566px 0px, rgb(0 0 0) -1.30729px -1.5136px 0px, rgb(0 0 0) -0.421592px -1.95506px 0px, rgb(0 0 0) 0.567324px -1.91785px 0px, rgb(0 0 0) 1.41734px -1.41108px 0px, rgb(0 0 0) 1.92034px -0.558831px 0px;`,
    `
    <div style="background:#1c1c1c;border-radius:10px;
                box-shadow:5px 5px rgba(0,0,0,0.3);
                padding:0;display:flex;width:100%;height:100%;overflow:hidden;">

      <div style="display:flex;flex-direction:column;flex:1;min-width:0;border-right:2px solid #444444;">
        <div id="editLabel"
             style="text-align:center;background:#252525;padding:14px 18px;
                    font-size:14px;letter-spacing:1px;flex-shrink:0;">
        </div>
        <div id="left_actions"
             style="flex-shrink:0;border-bottom:2px solid #444444;padding:15px 20px;
                    display:flex;gap:5px;background:#1c1c1c;"></div>
        <div id="con_edit"
             style="flex:1;overflow:auto;padding:18px 18px 18px 0;margin-left:18px;white-space:pre-wrap;
                    font-size:14px;line-height:1.7;word-wrap:break-word;position:relative;">
        </div>
        <div id="left_footer"
             style="flex-shrink:0;border-top:2px solid #444444;background:#1a1a1a;
                    padding:15px 20px;display:flex;justify-content:space-between;align-items:center;
                    font-size:14px;color:#888;letter-spacing:0.3px;">
          <span>Toggle: <span style="color:#f5945d;">Shift \`</span> · Version: <span style="color:#f5945d;">${version}</span></span>
          <span>Made by <span style="color:#f5945d; cursor: pointer;" onclick='window.open("https://github.com/Furaken/florr.io/blob/main/script/customizer.js")'>Furaken</span> · Discord: <span style="color:#f5945d;">@samerkizi</span></span>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;width:280px;flex-shrink:0;">

        <div style="display:flex;border-bottom:2px solid #444444;flex-shrink:0;">
          <div id="tab_btn_color"
               style="flex:1;padding:14px 0;text-align:center;cursor:pointer;font-size:14px;
                      letter-spacing:1.5px;transition:background 0.15s;">COLOR</div>
          <div style="width:2px;background:#444444;flex-shrink:0;"></div>
          <div id="tab_btn_text"
               style="flex:1;padding:14px 0;text-align:center;cursor:pointer;font-size:14px;
                      letter-spacing:1.5px;transition:background 0.15s;">TEXT</div>
        </div>

        <div id="con_nav_list"
             style="flex:1;overflow-y:auto;padding:10px 8px;"></div>

        <div id="con_nav_actions"
             style="border-top:2px solid #444444;padding:10px 8px;
                    display:flex;flex-direction:column;gap:6px;flex-shrink:0;"></div>

      </div>
    </div>

    <div id="closeButton"
         style="cursor:pointer;background-color:#BB5555;background-image:url(${CLOSE_SVG});background-position:center;background-size:contain;background-repeat:no-repeat;border:4px solid #974545;border-radius:5px;height:25px;width:25px;margin-left:5px;flex-shrink:0;box-shadow:4px 4px rgba(0,0,0,0.3)"></div>
    `
);

function setLabel(text, color) {
    const el = document.getElementById("editLabel");
    el.textContent = text;
    el.style.background = color || "#3d3d3d";
}

function setNestedPath(obj, path, val) {
    let cur = obj;
    for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
    cur[path[path.length - 1]] = val;
}

function renderJsonNode(parent, val, path) {
    const pad = 28;
    if (val === null || typeof val !== 'object') {
        let color = typeof val === 'string' ? '#e6db74'
            : typeof val === 'boolean' ? '#fd971f'
                : '#ae81ff';
        let display = typeof val === 'string' ? `"${val}"` : String(val);
        let node = createEle('span', parent,
            `cursor:pointer;color:${color};border-bottom:1px dashed #555;
             padding:0 2px;border-radius:2px;`,
            display);
        node.title = 'Click to edit';
        node.onclick = function (e) {
            e.stopPropagation();
            let input = prompt(`Edit: ${path.join('.')}:`, String(val));
            if (input === null) return;
            let newVal;
            try { newVal = JSON.parse(input); } catch (_) { newVal = input; }
            setNestedPath(ls, path, newVal);
            saveLS(); showJsonView();
        };
    } else if (Array.isArray(val)) {
        val.forEach((item, i) => {
            let row = createEle('div', parent,
                `margin-left:${pad}px;line-height:2;display:flex;align-items:baseline;flex-wrap:wrap;gap:4px;`);
            createEle('span', row, 'color:#888;flex-shrink:0;', `[${i}]:`);
            if (item !== null && typeof item === 'object') {
                let sub = createEle('div', parent,
                    `margin-left:${pad}px;border-left:1px solid #2e2e3a;margin-bottom:2px;`);
                renderJsonNode(sub, item, [...path, i]);
            } else {
                renderJsonNode(row, item, [...path, i]);
            }
        });
    } else {
        Object.entries(val).forEach(([key, v]) => {
            let row = createEle('div', parent,
                `margin-left:${pad}px;line-height:2;display:flex;align-items:baseline;flex-wrap:wrap;gap:4px;`);
            createEle('span', row, 'color:#6dbfb8;flex-shrink:0;', `${key}:`);
            if (v !== null && typeof v === 'object') {
                let sub = createEle('div', parent,
                    `margin-left:${pad}px;border-left:1px solid #2e2e3a;margin-bottom:2px;`);
                renderJsonNode(sub, v, [...path, key]);
            } else {
                renderJsonNode(row, v, [...path, key]);
            }
        });
    }
}

function showJsonView() {
    setLabel("FLORR CUSTOMIZER", "#3d3d3d");
    const con = document.getElementById("con_edit");
    con.innerHTML = '';
    renderJsonNode(con, ls, []);
}


function appendJSON(incoming) {
    let added = 0;
    if (incoming.color && Array.isArray(incoming.color.from)) {
        incoming.color.from.forEach((fromRule, i) => {
            if (!ls.color.from.find(x => x.color === fromRule.color)) {
                ls.color.from.push(fromRule);
                ls.color.to.push(incoming.color.to[i]);
                added++;
            }
        });
    }
    if (Array.isArray(incoming.text)) {
        incoming.text.forEach(t => {
            if (!ls.text.find(x => x.from === t.from)) {
                ls.text.push(t);
                added++;
            }
        });
    }
    return added;
}

function renderLeftActions() {
    const bar = document.getElementById("left_actions");
    bar.innerHTML = '';
    const btn = "cursor:pointer;padding:8px 10px;border-radius:6px;font-size:14px;" +
        "text-align:center;flex:1;font-weight:600;letter-spacing:0.3px;" +
        "transition:filter 0.12s,background 0.12s;";

    createEle("div", bar, btn + "border:2.5px solid #383838;background:#505050;color:#eee;", "Copy JSON")
        .onclick = () => navigator.clipboard.writeText(JSON.stringify(ls, null, 4));

    createEle("div", bar, btn + "border:2.5px solid #7a2020;background:#c04040;", "Reset All")
        .onclick = function () {
            if (!confirm("Reset ALL color and text rules?")) return;
            ls = { color: { from: [], to: [] }, text: [] };
            selectedColorIndex = -1; selectedTextIndex = -1;
            saveLS(); renderAll(); showJsonView();
        };

    createEle("div", bar, btn + "border:2.5px solid #2d6b65;background:#4a9e97;", "Refresh")
        .onclick = function () {
            renderAll();
            if (selectedColorIndex >= 0) showColorDetail(selectedColorIndex);
            else if (selectedTextIndex >= 0) showTextDetail(selectedTextIndex);
            else showJsonView();
        };

    createEle("div", bar, btn + "border:2.5px solid #5e3a6e;background:#8a5aab;", "Append JSON")
        .onclick = function () {
            let input = prompt("Paste JSON to merge:");
            if (!input) return;
            let incoming;
            try { incoming = JSON.parse(input); } catch (e) { alert("Invalid JSON: " + e.message); return; }
            let added = appendJSON(incoming);
            saveLS(); renderAll();
            if (selectedColorIndex >= 0) showColorDetail(selectedColorIndex);
            else if (selectedTextIndex >= 0) showTextDetail(selectedTextIndex);
            else showJsonView();
            alert(`Done — added ${added} new rule(s).`);
        };
}

function showColorDetail(index) {
    selectedColorIndex = index;
    const x = ls.color.from[index];
    const to = ls.color.to[index];
    const con = document.getElementById("con_edit");
    const isRadial = to.type === "radial";

    setLabel(`COLOR RULE  #${index + 1}`, "rgb(74,158,151)");
    con.innerHTML = "";

    const enabledColor = x.enabled !== false;
    let toggleRowColor = createEle("div", con, "display:flex;align-items:center;gap:8px;margin-bottom:14px;");
    let toggleBtnColor = createEle("div", toggleRowColor,
        `cursor:pointer;padding:4px 14px;border-radius:4px;font-size:14px;font-weight:600;
         border:2px solid ${enabledColor ? '#2d5a3d' : '#555'};
         background:${enabledColor ? '#3a7a4a' : '#333'};`,
        enabledColor ? 'Enabled' : 'Disabled');
    toggleBtnColor.onclick = function () {
        ls.color.from[index].enabled = !enabledColor;
        saveLS(); renderAll(); showColorDetail(index);
    };

    let fromRow = createEle("div", con, "margin-bottom:14px;");
    createEle("div", fromRow, "font-size:14px;color:#aaa;margin-bottom:4px;", "MATCH COLOR");
    let swatchRow = createEle("div", fromRow, "display:flex;gap:8px;align-items:center;");
    let colorBtn = createEle("div", swatchRow,
        `display:inline-flex;align-items:center;gap:8px;
         background:${addAlpha(x.color, x.alpha === "*" ? 1 : x.alpha)};
         border:2px solid #555;border-radius:6px;padding:3px 10px;cursor:pointer;`,
        `<span style="font-size:14px;">${x.color}</span>`);
    colorBtn.onclick = async function () {
        let color = await pickColor(x.color);
        if (!color) return;
        ls.color.from[index].color = color;
        saveLS(); renderAll();
    };
    let fromAlphaBtn = createEle("div", swatchRow,
        "display:inline-flex;align-items:center;border:2px solid #555;border-radius:6px;padding:3px 10px;cursor:pointer;background:#333;font-size:14px;",
        `α: ${fmtAlpha(x.alpha)}`);
    fromAlphaBtn.onclick = function () {
        let alpha = prompt("Alpha (0-1  or  * for any):", x.alpha);
        if (alpha === null) return;
        if (alpha !== "*") { alpha = isNaN(alpha) ? 1 : Math.min(Math.max(Number(alpha), 0), 1); }
        ls.color.from[index].alpha = alpha;
        saveLS(); renderAll();
    };

    createEle("div", con, "font-size:14px;color:#aaa;margin-bottom:6px;margin-top:14px;", "REPLACEMENT");

    let typeRow = createEle("div", con, "display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap;");
    createEle("span", typeRow, "font-size:14px;color:#aaa;", "Type:");
    ["solid", "linear", "radial", "animated"].forEach(t => {
        let active = t === to.type;
        let pill = createEle("div", typeRow,
            `cursor:pointer;padding:3px 10px;border-radius:4px;font-size:14px;
             border:2px solid ${active ? '#2d6b65' : '#555'};
             background:${active ? '#4a9e97' : '#333'};
             transition:background 0.12s,border-color 0.12s;`,
            t);
        pill.onclick = function () {
            if (t === to.type) return;
            if (!confirm(`Changing type will reset data. Continue?\n\n${JSON.stringify(to.data, null, 2)}`)) return;
            to.type = t;
            if (t === "solid") to.data = x.color;
            else if (t === "linear") to.data = { pos: { x0: null, y0: null, x1: null, y1: null, defaultEnd: { x: 100, y: 100 } }, colorStop: [{ offset: 0, color: x.color }, { offset: 1, color: x.color }] };
            else if (t === "radial") to.data = { pos: { x0: -1, y0: -1, r0: 1, x1: 1, y1: 1, r1: null, defaultEnd: { x: null, y: null, r: 3 } }, colorStop: [{ offset: 0, color: x.color }, { offset: 1, color: x.color }] };
            else if (t === "animated") {
                to.data = { duration: 5, keyframes: [x.color, x.color] };
                animatedObj[index] = { isTriggered: false, color: x.color, keyFrames: [], totalFrames: 0, currentFrame: 0 };
            } else {
                animatedObj[index] = null;
            }
            saveLS(); renderAll();
        };
    });

    let alphaBtn = createEle("div", typeRow,
        "cursor:pointer;padding:3px 10px;border-radius:4px;border:1px solid #555;background:rgb(37, 37, 37);font-size:14px;margin-left:auto;",
        `α out: ${fmtAlpha(to.alpha)}`);
    alphaBtn.onclick = function () {
        let v = prompt("Output alpha (0-1  or  *):", to.alpha);
        if (v === null) return;
        if (v !== "*") { v = isNaN(v) ? 1 : Math.min(Math.max(Number(v), 0), 1); }
        to.alpha = v;
        saveLS(); renderAll();
    };

    let contentArea = createEle("div", con, "margin-top:6px;display:flex;flex-direction:column;gap:6px;");

    if (to.type === "solid") {
        let solidBtn = createEle("div", contentArea,
            `cursor:pointer;padding:3px 10px;border-radius:6px;border:2px solid #555;
             background:${to.data};display:inline-flex;align-items:center;gap:10px;`,
            `<span>Color:</span><span style="font-size:14px;">${to.data}</span>`);
        solidBtn.onclick = async function () {
            let color = await pickColor(to.data);
            if (!color) return;
            to.data = color;
            saveLS(); renderAll();
        };

    } else if (to.type === "linear" || to.type === "radial") {
        let pos = to.data.pos;

        let makeCoordBtn = (label, vals, apply) => {
            let btn = createEle("div", contentArea,
                "cursor:pointer;padding:3px 10px;border-radius:4px;border:2px solid rgb(85, 85, 85);background:rgb(37, 37, 37);font-size:14px;",
                `${label}: <span style="color:#e6db74;">${vals}</span>`);
            btn.onclick = apply;
        };

        if (!isRadial) {
            makeCoordBtn("Start (x, y)", `${pos.x0}, ${pos.y0}`, function () {
                let r = getPosition(pos.x0, pos.y0, null, false);
                if (!r) return;
                pos.x0 = r.x; pos.y0 = r.y;
                saveLS(); renderAll();
            });
            makeCoordBtn("End (x, y)", `${pos.x1}, ${pos.y1}`, function () {
                let r = getPosition(pos.x1, pos.y1, null, false);
                if (!r) return;
                pos.x1 = r.x; pos.y1 = r.y;
                saveLS(); renderAll();
            });
            makeCoordBtn("Default end (x, y)", `${pos.defaultEnd.x}, ${pos.defaultEnd.y}`, function () {
                let r = getPosition(pos.defaultEnd.x, pos.defaultEnd.y, null, false);
                if (!r) return;
                pos.defaultEnd.x = r.x; pos.defaultEnd.y = r.y;
                saveLS(); renderAll();
            });
        } else {
            makeCoordBtn("Center (x, y, r)", `${pos.x0}, ${pos.y0}, ${pos.r0}`, function () {
                let r = getPosition(pos.x0, pos.y0, pos.r0, true);
                if (!r) return;
                pos.x0 = r.x; pos.y0 = r.y; pos.r0 = r.r;
                saveLS(); renderAll();
            });
            makeCoordBtn("Outer (x, y, r)", `${pos.x1}, ${pos.y1}, ${pos.r1}`, function () {
                let r = getPosition(pos.x1, pos.y1, pos.r1, true);
                if (!r) return;
                pos.x1 = r.x; pos.y1 = r.y; pos.r1 = r.r;
                saveLS(); renderAll();
            });
            makeCoordBtn("Default outer r", `${pos.defaultEnd.x}, ${pos.defaultEnd.y}, ${pos.defaultEnd.r}`, function () {
                let r = getPosition(pos.defaultEnd.x, pos.defaultEnd.y, pos.defaultEnd.r, true);
                if (!r) return;
                pos.defaultEnd.x = r.x; pos.defaultEnd.y = r.y; pos.defaultEnd.r = r.r;
                saveLS(); renderAll();
            });
        }

        createEle("div", contentArea, "font-size:14px;color:#aaa;margin-top:4px;", "COLOR STOPS");
        to.data.colorStop.forEach((stop, si) => {
            let stopRow = createEle("div", contentArea,
                `display:flex;align-items:center;gap:6px;`);
            let offBtn = createEle("div", stopRow,
                `cursor:pointer;padding:3px 10px;border-radius:4px;border:2px solid rgb(85, 85, 85);background:rgb(37, 37, 37);font-size:14px;`,
                `offset ${stop.offset.toFixed(2)}`);
            offBtn.onclick = function () {
                let offStr = prompt("Offset (0–1):", stop.offset);
                if (offStr === null) return;
                let off = parseFloat(offStr);
                if (isNaN(off)) return;
                to.data.colorStop[si].offset = Math.min(Math.max(off, 0), 1);
                saveLS(); renderAll();
            };
            let colBtn = createEle("div", stopRow,
                `cursor:pointer;padding:3px 10px;border-radius:4px;border:2px solid rgb(85, 85, 85);background:${stop.color};font-size:14px;`,
                stop.color);
            colBtn.onclick = async function () {
                let col = await pickColor(stop.color);
                if (!col) return;
                to.data.colorStop[si].color = col;
                saveLS(); renderAll();
            };
        });

        let stopBtns = createEle("div", contentArea, "display:flex;gap:5px;");
        let addStop = createEle("div", stopBtns,
            "cursor:pointer;padding:3px 10px;border-radius:4px;border:2.5px solid #2d6b65;background:#4a9e97;font-size:14px;",
            "+ Stop");
        addStop.onclick = function () {
            to.data.colorStop.push({ ...to.data.colorStop[to.data.colorStop.length - 1] });
            saveLS(); renderAll();
        };
        let remStop = createEle("div", stopBtns,
            "cursor:pointer;padding:3px 10px;border-radius:4px;border:2.5px solid #7a2020;background:#c04040;font-size:14px;",
            "- Stop");
        remStop.onclick = function () {
            if (to.data.colorStop.length <= 2) { alert("Need at least 2 stops."); return; }
            to.data.colorStop.pop();
            saveLS(); renderAll();
        };

    } else if (to.type === "animated") {
        let durBtn = createEle("div", contentArea,
            "cursor:pointer;padding:3px 10px;border-radius:4px;border:2px solid rgb(85, 85, 85);background:rgb(37, 37, 37);font-size:14px;",
            `Duration: <span style="color:#e6db74;">${to.data.duration}s</span>`);
        durBtn.onclick = function () {
            let v = prompt("Duration (seconds, > 0):", to.data.duration);
            if (!v) return;
            let n = parseFloat(v);
            if (isNaN(n) || n <= 0) { alert("Invalid."); return; }
            to.data.duration = n;
            if (animatedObj[index]) animatedObj[index].totalFrames = 60 * n;
            saveLS(); renderAll();
        };

        createEle("div", contentArea, "font-size:14px;color:#aaa;margin-top:4px;", "KEYFRAMES");
        to.data.keyframes.forEach((kf, ki) => {
            let kfBtn = createEle("div", contentArea,
                `cursor:pointer;display:flex;align-items:center;gap:8px;
                 padding:3px 10px;border-radius:4px;border:2px solid rgb(85, 85, 85);background:${kf};`);
            createEle("span", kfBtn, "font-size:14px;", `Keyframe ${ki}: ${kf}`);
            kfBtn.onclick = async function () {
                let v = await pickColor(kf);
                if (!v) return;
                to.data.keyframes[ki] = v;
                if (animatedObj[index]) animatedObj[index].keyFrames = to.data.keyframes.map(c => { let r = hexToRgb(c); return [r.r, r.g, r.b]; });
                saveLS(); renderAll();
            };
        });
        let kfBtns = createEle("div", contentArea, "display:flex;gap:5px;");
        createEle("div", kfBtns,
            "cursor:pointer;padding:3px 10px;border-radius:4px;border:2.5px solid #2d6b65;background:#4a9e97;font-size:14px;",
            "+ Frame").onclick = function () {
                to.data.keyframes.push(to.data.keyframes[to.data.keyframes.length - 1]);
                saveLS(); renderAll();
            };
        createEle("div", kfBtns,
            "cursor:pointer;padding:3px 10px;border-radius:4px;border:2.5px solid #7a2020;background:#c04040;font-size:14px;",
            "- Frame").onclick = function () {
                if (to.data.keyframes.length <= 2) { alert("Need at least 2 keyframes."); return; }
                to.data.keyframes.pop();
                saveLS(); renderAll();
            };
    }

    createEle("div", con, "height:1px;background:#3a3a42;margin:20px 0 14px;");
    createEle("div", con,
        "cursor:pointer;display:inline-block;padding:6px 16px;border-radius:5px;border:2.5px solid #7a2020;background:#c04040;font-size:14px;",
        "Delete").onclick = function () {
            if (!confirm(`Delete rule #${index}?`)) return;
            ls.color.from.splice(index, 1);
            ls.color.to.splice(index, 1);
            selectedColorIndex = -1;
            saveLS(); renderAll(); showJsonView();
        };
}

function showTextDetail(index) {
    selectedTextIndex = index;
    const t = ls.text[index];
    const con = document.getElementById("con_edit");

    setLabel(`TEXT RULE  #${index + 1}`, "#7a5a8a");
    con.innerHTML = "";

    const enabledText = t.enabled !== false;
    let toggleRowText = createEle("div", con, "display:flex;align-items:center;gap:8px;margin-bottom:14px;");
    let toggleBtnText = createEle("div", toggleRowText,
        `cursor:pointer;padding:4px 14px;border-radius:4px;font-size:14px;font-weight:600;
         border:2px solid ${enabledText ? '#2d5a3d' : '#555'};
         background:${enabledText ? '#3a7a4a' : '#333'};`,
        enabledText ? 'Enabled' : 'Disabled');
    toggleBtnText.onclick = function () {
        ls.text[index].enabled = !enabledText;
        saveLS(); renderAll(); showTextDetail(index);
    };

    createEle("div", con, "font-size:14px;color:#aaa;margin-bottom:4px;", "PATTERN (REGEX)");
    let fromBtn = createEle("div", con,
        "cursor:pointer;padding:7px 14px;border-radius:6px;border:2px solid #785978;background:#3e2e42;font-size:14px;margin-bottom:14px;word-break:break-all;",
        `/<span style="color:#e6db74;">${t.from}</span>/g`);
    fromBtn.onclick = function () {
        let v = prompt("Pattern (regex):", t.from);
        if (!v) return;
        ls.text[index].from = v;
        saveLS(); renderAll();
    };

    createEle("div", con, "font-size:14px;color:#aaa;margin-bottom:4px;", "REPLACEMENT STRING");
    let toBtn = createEle("div", con,
        "cursor:pointer;padding:7px 14px;border-radius:6px;border:2px solid #555;background:#252525;font-size:14px;margin-bottom:14px;word-break:break-all;",
        `"<span style="color:#e6db74;">${t.to || '<empty>'}</span>"`);
    toBtn.onclick = function () {
        let v = prompt("Replacement string:", t.to);
        if (v === null) return;
        ls.text[index].to = v;
        saveLS(); renderAll();
    };

    createEle("div", con, "height:1px;background:#3a3a42;margin:20px 0 14px;");
    createEle("div", con,
        "cursor:pointer;display:inline-block;padding:6px 16px;border-radius:5px;border:2.5px solid #7a2020;background:#c04040;font-size:14px;",
        "Delete").onclick = function () {
            if (!confirm(`Delete text rule #${index}?`)) return;
            ls.text.splice(index, 1);
            selectedTextIndex = -1;
            saveLS(); renderAll(); showJsonView();
        };
}

function showFindColorResults() {
    const con = document.getElementById("con_edit");
    setLabel("COLOR FINDER RESULTS", "#5a3a7a");
    con.innerHTML = "";

    if (!findColorArr.length) {
        createEle("div", con, "color:#aaa;", "No new colors were detected.\n\nMove around in-game while Find Color is active.");
        return;
    }

    let grid = createEle("div", con,
        "display:flex;flex-wrap:wrap;overflow:hidden;");
    const shadow = `color:#fff;text-shadow:rgb(0 0 0) 2px 0px 0px,rgb(0 0 0) 1.75517px 0.958851px 0px,rgb(0 0 0) 1.0806px 1.68294px 0px,rgb(0 0 0) 0.141474px 1.99499px 0px,rgb(0 0 0) -0.832294px 1.81859px 0px,rgb(0 0 0) -1.60229px 1.19694px 0px,rgb(0 0 0) -1.97998px 0.28224px 0px,rgb(0 0 0) -1.87291px -0.701566px 0px,rgb(0 0 0) -1.30729px -1.5136px 0px,rgb(0 0 0) -0.421592px -1.95506px 0px,rgb(0 0 0) 0.567324px -1.91785px 0px,rgb(0 0 0) 1.41734px -1.41108px 0px,rgb(0 0 0) 1.92034px -0.558831px 0px;`;

    findColorArr.forEach(({ color, alpha }) => {
        let cell = createEle("div", grid,
            `cursor:pointer;padding:8px 10px;width:max-content;background:${addAlpha(color, alpha)};font-size:14px;font-weight:700;${shadow}`,
            `${color} · ${fmtAlpha(alpha)}`);
        cell.onclick = function() {
            if (ls.color.from.find(x => x.color === color)) { alert("Rule already exists."); return; }
            ls.color.from.push({ color, alpha });
            ls.color.to.push({ type: "solid", alpha: "*", preview: color, data: color });
            saveLS(); renderAll();
        };
    });
}

function renderTabButtons() {
    const cb = document.getElementById("tab_btn_color");
    const tb = document.getElementById("tab_btn_text");
    cb.style.background = activeTab === 'color' ? "rgb(74,158,151)" : "transparent";
    cb.style.color = activeTab === 'color' ? "#fff" : "#aaa";
    tb.style.background = activeTab === 'text' ? "#7a5a8a" : "transparent";
    tb.style.color = activeTab === 'text' ? "#fff" : "#aaa";
}

function renderColorNav() {
    const list = document.getElementById("con_nav_list");
    const actions = document.getElementById("con_nav_actions");
    list.innerHTML = "";
    actions.innerHTML = "";

    if (!ls.color.from.length) {
        createEle("div", list, "color:#666;font-size:14px;padding:6px;text-align:center;",
            "No color rules yet.\nAdd one below.");
    }

    ls.color.from.forEach((x, i) => {
        const to = ls.color.to[i];
        const isSelected = (i === selectedColorIndex);
        const toColor = (to.type === "solid") ? to.data
            : (to.data.colorStop ? to.data.colorStop[0].color : x.color);
        const enabled = x.enabled !== false;

        let wrapper = createEle("div", list,
            `display:flex;align-items:stretch;border-radius:7px;margin-bottom:5px;overflow:hidden;
             outline:2px solid ${isSelected ? '#6dbfb8' : 'transparent'};
             transition:outline 0.1s;opacity:${enabled ? '1' : '0.5'};`);

        let toggleBtn = createEle("div", wrapper,
            `cursor:pointer;padding:0 9px;display:flex;align-items:center;justify-content:center;
             background:${enabled ? '#2d5a3d' : '#3a3a3a'};border-right:2px solid rgba(0,0,0,0.25);
             flex-shrink:0;font-size:15px;`,
            enabled ? '●' : '○');
        toggleBtn.title = enabled ? 'Disable rule' : 'Enable rule';
        toggleBtn.onclick = function (e) {
            e.stopPropagation();
            ls.color.from[i].enabled = !enabled;
            saveLS(); renderAll();
            if (selectedColorIndex === i) showColorDetail(i);
        };

        let row = createEle("div", wrapper, `cursor:pointer;display:flex;flex:1;min-width:0;`);

        const cellText = `color:#fff;text-shadow:rgb(0 0 0) 2px 0px 0px, rgb(0 0 0) 1.75517px 0.958851px 0px, rgb(0 0 0) 1.0806px 1.68294px 0px, rgb(0 0 0) 0.141474px 1.99499px 0px, rgb(0 0 0) -0.832294px 1.81859px 0px, rgb(0 0 0) -1.60229px 1.19694px 0px, rgb(0 0 0) -1.97998px 0.28224px 0px, rgb(0 0 0) -1.87291px -0.701566px 0px, rgb(0 0 0) -1.30729px -1.5136px 0px, rgb(0 0 0) -0.421592px -1.95506px 0px, rgb(0 0 0) 0.567324px -1.91785px 0px, rgb(0 0 0) 1.41734px -1.41108px 0px, rgb(0 0 0) 1.92034px -0.558831px 0px;`;

        let leftCell = createEle("div", row,
            `flex:1;min-width:0;padding:8px 10px;display:flex;align-items:baseline;gap:6px;
             background:${addAlpha(x.color, x.alpha === "*" ? 1 : x.alpha)};`);
        createEle("span", leftCell,
            `font-size:14px;padding: 0 2px;font-weight:700;${cellText}overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:1;min-width:0;`,
            x.color);
        createEle("span", leftCell,
            `font-size:14px;${cellText}opacity:0.75;flex-shrink:0;`,
            `(${fmtAlpha(x.alpha)})`);

        let rightCell = createEle("div", row,
            `flex:1;min-width:0;padding:8px 10px;display:flex;align-items:baseline;gap:6px;
             background:${toColor};border-left:2px solid rgba(0,0,0,0.2);`);
        createEle("span", rightCell,
            `font-size:14px;padding: 0 2px;font-weight:700;${cellText}overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:1;min-width:0;`,
            to.type);
        createEle("span", rightCell,
            `font-size:14px;${cellText}opacity:0.75;flex-shrink:0;`,
            `(${fmtAlpha(to.alpha)})`);

        row.onclick = function () { showColorDetail(i); renderAll(); };
    });

    const btnStyle = "cursor:pointer;padding:7px 6px;border-radius:6px;font-size:14px;text-align:center;";

    let addBtn = createEle("div", actions,
        btnStyle + "border:2.5px solid #2d6b65;background:#4a9e97;", "New Color Rule");
    addBtn.onclick = function () {
        let color = prompt("Match color (hex #rrggbb):", "#ffffff");
        if (!color) return;
        if (!/^#[A-Fa-f0-9]{6}$/.test(color)) { alert("Invalid hex color."); return; }
        let alpha = prompt("Match alpha (0-1  or  * for any):", "*");
        if (alpha !== "*") { alpha = isNaN(alpha) ? 1 : Math.min(Math.max(Number(alpha), 0), 1); }
        ls.color.from.push({ color, alpha });
        ls.color.to.push({ type: "solid", alpha: "*", preview: color, data: color });
        selectedColorIndex = ls.color.from.length - 1;
        saveLS(); renderAll();
    };

    let findBtn = createEle("div", actions,
        btnStyle + "border:2.5px solid #5e3a6e;background:#8a5aab;", isFindColor ? "Stop Finding" : "Find Color");
    findBtn.onclick = function () {
        if (!isFindColor) {
            findColorArr = [];
            isFindColor = true;
            renderAll();
        } else {
            isFindColor = false;
            renderAll();
            showFindColorResults();
        }
    };
    if (isFindColor) findBtn.style.cssText += ";background:#c04040;border-color:#7a2020;";

    createEle("div", actions,
        btnStyle + "border:2.5px solid #3a5a7a;background:#4a7aab;", "View JSON")
        .onclick = function () { showJsonView(); };
}

function renderTextNav() {
    const list = document.getElementById("con_nav_list");
    const actions = document.getElementById("con_nav_actions");
    list.innerHTML = "";
    actions.innerHTML = "";

    if (!ls.text.length) {
        createEle("div", list, "color:#666;font-size:14px;padding:6px;text-align:center;",
            "No text rules yet.\nAdd one below.");
    }

    ls.text.forEach((t, i) => {
        const isSelected = (i === selectedTextIndex);
        const enabled = t.enabled !== false;

        let wrapper = createEle("div", list,
            `display:flex;align-items:stretch;border-radius:7px;margin-bottom:5px;overflow:hidden;
             outline:2px solid ${isSelected ? '#be95be' : 'transparent'};
             transition:outline 0.1s;opacity:${enabled ? '1' : '0.5'};`);

        let toggleBtn = createEle("div", wrapper,
            `cursor:pointer;padding:0 9px;display:flex;align-items:center;justify-content:center;
             background:${enabled ? '#2d5a3d' : '#3a3a3a'};border-right:2px solid rgba(0,0,0,0.25);
             flex-shrink:0;font-size:15px;`,
            enabled ? '●' : '○');
        toggleBtn.title = enabled ? 'Disable rule' : 'Enable rule';
        toggleBtn.onclick = function (e) {
            e.stopPropagation();
            ls.text[i].enabled = !enabled;
            saveLS(); renderAll();
            if (selectedTextIndex === i) showTextDetail(i);
        };

        let row = createEle("div", wrapper, `cursor:pointer;display:flex;flex:1;min-width:0;`);

        let leftCell = createEle("div", row,
            `flex:1;min-width:0;padding:8px 10px;display:flex;flex-direction:column;gap:1px;
             background:#3a2a4a;`);
        createEle("span", leftCell,
            `font-size:14px;padding: 0 2px;font-weight:700;color:#e6db74;
             overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,
            `/${t.from}/g`);

        let rightCell = createEle("div", row,
            `flex:1;min-width:0;padding:8px 10px;display:flex;flex-direction:column;gap:1px;
             background:#252535;border-left:2px solid rgba(0,0,0,0.2);`);
        createEle("span", rightCell,
            `font-size:14px;padding: 0 2px;font-weight:700;color:#6dbfb8;
             overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`,
            `"${t.to || ''}"`);

        row.onclick = function () { showTextDetail(i); renderAll(); };
    });

    const btnStyle = "cursor:pointer;padding:7px 6px;border-radius:6px;font-size:14px;text-align:center;";

    createEle("div", actions,
        btnStyle + "border:2.5px solid #5e3a6e;background:#8a5aab;", "New Text Rule").onclick = function () {
            let from = prompt("Pattern (regex):");
            if (!from) return;
            if (ls.text.find(x => x.from === from)) { alert("Pattern already exists."); return; }
            let to = prompt("Replacement string:") || "";
            ls.text.push({ from, to });
            selectedTextIndex = ls.text.length - 1;
            saveLS(); renderAll();
        };

    createEle("div", actions,
        btnStyle + "border:2.5px solid #3a5a7a;background:#4a7aab;", "View JSON")
        .onclick = function () { showJsonView(); };
}

function renderAll() {
    renderTabButtons();
    renderLeftActions();
    if (activeTab === 'color') {
        renderColorNav();
        if (selectedColorIndex >= 0 && selectedColorIndex < ls.color.from.length)
            showColorDetail(selectedColorIndex);
    } else {
        renderTextNav();
        if (selectedTextIndex >= 0 && selectedTextIndex < ls.text.length)
            showTextDetail(selectedTextIndex);
    }
}

document.getElementById("tab_btn_color").onclick = function () {
    activeTab = 'color';
    selectedTextIndex = -1;
    renderAll();
    showJsonView();
};
document.getElementById("tab_btn_text").onclick = function () {
    activeTab = 'text';
    selectedColorIndex = -1;
    renderAll();
    showJsonView();
};

ls.color.from.forEach((x, index) => {
    const to = ls.color.to[index];
    if (to && to.type === "animated") {
        animatedObj[index] = {
            isTriggered: false,
            color: to.data.keyframes[0],
            keyFrames: to.data.keyframes,
            totalFrames: 60 * to.data.duration,
            currentFrames: 0
        };
    }
});

renderAll();
showJsonView();

document.documentElement.addEventListener("keydown", function (e) {
    if (e.keyCode == 192 && e.shiftKey) {
        container.style.transform = container.style.transform.includes("scale(1)")
            ? "translate(-50%, -50%) scale(0)"
            : "translate(-50%, -50%) scale(1)";
    }
});
document.getElementById("closeButton").onclick = function () {
    container.style.transform = "translate(-50%, -50%) scale(0)";
};

GM_addStyle(`
* { box-sizing: border-box; }
.button { cursor:pointer; }
select option { background:#2a2a2e; color:white; }
::-webkit-scrollbar { width:5px; height:5px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:#555;border-radius:5px; }
::-webkit-scrollbar-thumb:hover { background:#777; }

#left_actions div:hover { filter: brightness(1.2); }
#con_nav_list > div:hover { outline-color: #6dbfb8 !important; }
#con_nav_list > div:hover > div:not(:first-child) { filter: brightness(1.12); }
#con_nav_list span { font-size: 14px !important; }
#con_nav_actions div {
    font-size: 14px !important;
    font-weight: 600;
    letter-spacing: 0.4px;
    transition: filter 0.12s, background 0.12s;
}
#con_nav_actions div:hover { filter: brightness(1.2); }
#tab_btn_color, #tab_btn_text {
    font-size: 16px !important;
    font-weight: 700;
    letter-spacing: 1.5px;
}
#editLabel {
    font-size: 16px !important;
    font-weight: 700;
    letter-spacing: 2px;
}
#con_edit {
    font-size: 14px !important;
    line-height: 1.75 !important;
}
`);
