// ==UserScript==
// @name         Attack call for help
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

let server = "https://torn.rocks/api/player_assistance";

function walk(element) {
    let name = element.id;
    if(name != null && name.trim().length > 0) {
        name = name.trim();
    } else {
        name = null;
    }

    let children = null;
    if(element.childNodes.length > 0) {
        let results = []
        for(const child of element.childNodes) {
            let result = walk(child);
            if(result != null) {
                results.push(result);
            }
        }

        if(results.length > 1) {
            children = results;
        } else if(results.length > 0) {
            children = results[0];
        }
    }

    let value = element.textContent;
    if(value != null && value.trim().length > 0) {
        value = value.trim();
    } else {
        value = null;
    }

    if(name != null && children != null) {
        let x = {};
        x[name] = children;
        return x
    }

    if(children != null) {
        return children;
    }

    if(value != null) {
        return value;
    }
}

function get_player_details(element) {
    let player_details = walk(element);

    let gear = [];
    for(const entry of element.getElementsByTagName("area")) {
        gear.push(entry.title);
    }
    //console.log(gear);
    player_details.gear = gear;

    let weapons = []
    for(const entry of element.getElementsByTagName("figure")) {
        for(const child of entry.childNodes) {
            weapons.push(child.alt);
        }
    }
    //console.log(weapons);
    player_details.weapons = weapons;

    return player_details;
}

function ask_for_help(indicator) {
    // Set button to yellow while the request is active
    indicator.style.backgroundColor = "yellow";

    let target_id = window.location.search.match(/user2ID=\d+/);
    if(target_id != null) {
        target_id = target_id[0].split("=")[1];
    }

    let attacker_element = document.getElementById("attacker");
    let defender_element = document.getElementById("defender");
    let attacker = get_player_details(attacker_element);
    let defender = get_player_details(defender_element);

    let info = {attacker: attacker, defender: defender, target: target_id};
    let data = JSON.stringify(info);
    let r = GM_xmlhttpRequest({
        method: "POST",
        url: server,
        data: data,
        nocache: true,
        revalidate: true,
        fetch: false,
        headers: {
            "Content-Type": "application/json",
        },
        onabort: function(response) { console.log("onabort " + response.responseText); },
        onerror: function(response) { console.log("onerror"); indicator.style.backgroundColor = "red"; },
        onload: function(response) { console.log("onload " + response.responseText); indicator.style.backgroundColor = "green"; },
        // onprogress: function(response) { console.log("onprogress " + response.responseText); },
        // onreadystatechange: function(response) { console.log("onreadystatechange " + response.responseText); },
        ontimeout: function(response) { console.log("ontimeout " + response.responseText); },
    });
    console.log(r);

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

