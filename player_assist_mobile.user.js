// ==UserScript==
// @name         Attack call for help mobile version
// @namespace    Violentmonkey Scripts
// @match        https://www.torn.com/loader.php?sid=attack&user2ID=*
// @version      0.1
// @author       rDacted[2670953]
// @description  Adds a 'request for assistance' button to the attack page
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      torn.rocks
// @connect      *
// ==/UserScript==

let server = "https://torn.rocks/api/player_assistance_mobile";

function ask_for_help(indicator) {
    // Set button to yellow while the request is active
    indicator.style.backgroundColor = "yellow";

    let target_id = window.location.search.match(/user2ID=\d+/);
    if(target_id != null) {
        target_id = target_id[0].split("=")[1];
    }

    let react_root = document.getElementById("react-root");
    let info = {reactroot: react_root.innerHTML, target: target_id};
    let data = JSON.stringify(info);
    let headers = {"Content-Type": "application/json"};

    PDA_httpPost(server, headers, data).then(
            resolve => {
                indicator.style.backgroundColor = "green";
            },
            error => {
                indicator.style.backgroundColor = "red";
            });
}

function insertAfter(newNode, existingNode) {
    existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function create_div() {
    let target = document.getElementsByClassName('playersModelWrap___h62rQ');
    if(target.length == 1) {
        target = target[0];

        let firstChild = target.firstChild;
        const div1 = document.createElement("div");
        div1.setAttribute("style", "text-align: center; border: 4px solid");

        insertAfter(div1, firstChild);

        return div1;
    } else {
        console.log("Could not find players model wrap");
    }
}

function add_button() {
    let new_div = create_div();
    if(new_div != null) {
        console.log(new_div);

        let btn = document.createElement("button");
        btn.setAttribute("style", "font-weight:bold;");
        //btn.classList.add('boxy');
        btn.classList.add('wrap___OzSz_');
        btn.innerHTML = "CALL FOR EMERGENCY FACTION ASSISTANCE";
        btn.onclick = function () {
            ask_for_help(new_div);
        };
        new_div.appendChild(btn);
    }
}

function start() {
    console.log("Attack helper starting");
    add_button();
    console.log("Attack helper done");
}

//GM_addStyle('boxy {margin: 0;}');
//GM_addStyle("rdacted_block {display: block; text-align: center; width: 100%; border: none; background-color: #04AA6D; padding: 14px 28px; font-size: 16px; cursor: pointer; text-align: center;}");

// TODO
// This delay is needed as the div we search for isn't created until some point in the future
// There needs to be a better way to handle this - since this is quite long
setTimeout(function() { start(); }, 5000);

