/* todo
* loading spinner for validation button and submission button
* page 1: automatically select 'yes' in radio buttons if a checkbox is checked
*/

function endError() {
  $("#rsvp-box").remove();
  $("#rsvp-title").replaceWith("<div id='rsvp-title'> <strong> Oh no! Something went wrong. </strong> Please try again or contact us directly if things still don't work. </div>")
}

// page 3: confirmation of success  -------------------------------------------------------------------
function lastPageNotComing() {
  $("#rsvp-title").replaceWith("We're sorry you can't make it!");
  $("#rsvp-page1").replaceWith("We're sorry you can't make it!<br/><br/>Your RSVP has been submitted.");
}
function createLastPage(data) {
  $("#rsvp-title").replaceWith("Thanks for RSVP'ing!");
  $("#rsvp-page2").replaceWith(help_formatConfirm(data));
}
// 
function help_formatConfirm(data){
  var outHtml = help_helpConfrimPerson(data.person1,data.p1_comingFri,data.p1_comingSat,data.p1_comingSun,data.p1_foodChoice,data.p1_allergies)
  if (data.person2!=""){
    outHtml = outHtml + help_helpConfrimPerson(data.person2,data.p2_comingFri,data.p2_comingSat,data.p2_comingSun,data.p2_foodChoice,data.p2_allergies);
  }
  if (data.nKids!=undefined){
    outHtml = outHtml + "# Kids (Rehearsal): <b>" + data.nKids + "</b>";
  }
  return outHtml
}
function help_helpConfrimPerson(person,fri,sat,sun,food,allergies) {
var outHtml = "<div class='content'><u>" + person + "</u>";
if ((fri=="1") || (sat=="1") || (sun=="1")) {
  outHtml = outHtml + "<ul>";
  if (fri=="1") {outHtml = outHtml + "<li>Rehearsal Dinner (Friday, 6/30)</li>";}
  if (sat=="1") {outHtml = outHtml + "<li>Wedding Ceremony and Reception (Saturday, 7/1)</li>";}
  if (sun=="1") {outHtml = outHtml + "<li>Breakfast (Sunday, 7/2)</li>";}
  outHtml = outHtml + "</ul>";
  outHtml = outHtml + "Food Choice: <b>" + food + "</b><br/>";
  if (allergies!=""){
    outHtml = outHtml + "Food Considerations: " + allergies;
  }
} else {
  outHtml = outHtml + "<br/><br/>Can't make it!";
}
outHtml = outHtml + "</div>";
return outHtml
}

// submit form  -------------------------------------------------------------------
function submitForm(data,isComing) {
  // make request
  const url = 'https://script.google.com/macros/s/AKfycbygC6IgyI5iS0BxbPRd7hTItrtU6wua6BZ8lML5dAqVOwA567fNP4WZbHyB6h2ldBvx/exec';
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    if (xhr.status === 200 && xhr.responseText === 'Success') {
      if (isComing){
        createLastPage(data);
      } else {
        lastPageNotComing();
      };
    } else {
      endError(); return;
    }
  };
  xhr.onerror = function() {
    endError(); return; // Request failed due to a network error or other issue
  };
  xhr.send($.param(data));
}

// page 2 of the form -------------------------------------------------------------------
function createPage2(data,names) {
  var outStr = "<div id='rsvp-page2'>";
  
  outStr = outStr + "<div id='output'></div>"; // where error messages will go

  // check if either guest is going to friday dinner
  var isFriday = false;
  if ((data.p1_comingFri == "1") || (data.p2_comingFri == "1")){
    isFriday = true;
  } 

  if (isFriday) {
    outStr = outStr + "<div class='box'>Are you bringing any kids to the Friday rehearsal dinner? <br/><br/>" +
    "<div class='field'>If so, how many: " + 
    "<span class='select'><select id='kids'>" +
      "<option selected>0</option><option>1</option><option>2</option><option>3</option><option>4+</option>" +
    "</select></span>" +
    "</div></div>"; // field, box
  }

  outStr = outStr + '<article class="message">' +
    '<div class="message-header"><p>Food Options</p></div>' + 
    '<div class="message-body">' +
    '<ul><li><strong>Chicken</strong> - Bistro roasted chicken, thyme au jus</li>' +
    '<li><strong>Fish</strong> - Mustard & ginger glazed salmon</li>' +
    '<li><strong>Veg/Vegan</strong> - Herb gnocchi, arugula pesto, spring pea tendrils</li></ul>' +
    '</div></article><br/>';

  // write food cards
  if (data.p1_notComing=="0"){
    outStr = outStr + help_makeFoodCard(data.person1,1);
  }
  if (data.p2_notComing=="0"){
    outStr = outStr + help_makeFoodCard(data.person2,2);
  }

  outStr = outStr + 
  "<div class='buttons is-centered' style='flex-direction: column;'>" +
    "<div><button id='third-button' type='submit' class='button is-link is-medium'>RSVP!</button></div>" +
  "<div id='timeWarning' style='font-size: small; color: gray;'></div></div>"; // button;

  outStr = outStr + '</div>'; //id pag 2

  $("#rsvp-page1").replaceWith(outStr);
  $(document).ready(function() {
    window.scrollTo({ top: 0 });
  });

  // submit button on page 2
  $(document).on("click", "#third-button", function() {
    document.getElementById('timeWarning').innerHTML = "(This may take a few seconds)";
    document.getElementById('output').innerHTML = "";
    document.getElementById('third-button').classList.add('is-loading');

    // to prevent users from clicking on it multiple times
    document.getElementById('third-button').disabled = true;

    // read the user's inputs
    data.nKids = $("#kids").val();
    if (data.p1_notComing=="0") {
    data.p1_foodChoice = $("#foodChoice1").val()
    data.p1_allergies = $("#allergies1").val()
    }
    if (data.p2_notComing=="0"){
      data.p2_foodChoice = $("#foodChoice2").val()
      data.p2_allergies = $("#allergies2").val()
    }

    // data integrity checks
    if ((data.p1_foodChoice=="Select...")||(data.p2_foodChoice=="Select...")){
      document.getElementById('output').innerHTML = `<div class='notification is-danger'>Please make a food selection for each guest.</div>`;
       window.scrollTo({ top: 0 });;
       document.getElementById('timeWarning').innerHTML = "";
       document.getElementById('third-button').disabled = false;
       document.getElementById('third-button').classList.remove('is-loading');
       return;
    };

    if (((data.p1_foodChoice=="Other (e.g. vegan/vegetarian)")&&(data.p1_allergies=="")) ||
        ((data.p2_foodChoice=="Other (e.g. vegan/vegetarian)")&&(data.p2_allergies==""))){
      document.getElementById('output').innerHTML = `
      <div class='notification is-danger'>For guests with 'Other' food choice, please specify more detail.</div>`;
       window.scrollTo({ top: 0 });;
       document.getElementById('timeWarning').innerHTML = "";
       document.getElementById('third-button').disabled = false;
       document.getElementById('third-button').classList.remove('is-loading');
       return;
    };
    // submit form
    submitForm(data,true);
  });
}
function help_makeFoodCard(name,pNum){
  return "<div class='box'><strong class='content is-large'>" + name + "</strong><br/><br/>" +
  "Food choice (for wedding reception): <div class='select'><select id='foodChoice" + pNum +"'>" + 
    "<option>Select...</option><option>Chicken</option><option>Fish</option><option>Other (e.g. vegan/vegetarian)</option>" + 
    "</select></div><br/><br/>" +
  "Do you have any food allergies or dietary needs?<br/><textarea rows='3' maxLength='250' id='allergies"+ pNum +"' class='textarea' placeholder='List any food allergies or dietary needs'></textarea>" +
  "</div>"; // box
}

// page 1 of the form -------------------------------------------------------------------
function help_makeAttendCard(pNum,pName,isFridayInvite){
  outStr = "<div class='box'><div id='group"+pNum+"'><strong class='content is-large'>" + pName + "</strong><br/><br/>";

  outStr = outStr + "<div class='control'><label class='label'>Will you be attending?</label>" +
    "<label class='radio'><input type='radio' name='yesno"+pNum+"' id='yesRadio"+pNum+"' value='yes'>&nbsp&nbspYes</label>" +
    "<label class='radio'><input type='radio' name='yesno"+pNum+"' id='noRadio"+pNum+"' value='no'>&nbsp&nbspNo</label>" +
    "</div><br/><label class='label'>Events:</label>";

  if (isFridayInvite == "1"){
    outStr = outStr + "<div class='field'><label class='checkbox'><input type='checkbox' name='p"+pNum+"_comingFri' data-name='p"+pNum+"_comingFri'>&nbsp&nbsp&nbsp Rehearsal Dinner (Friday, 6/30)</label></div>";
  }
  outStr = outStr +
  "<div class='field'><label class='checkbox'><input type='checkbox' name='p"+pNum+"_comingSat' data-name='p"+pNum+"_comingSat'>&nbsp&nbsp&nbsp Wedding Ceremony and Reception (Saturday, 7/1)</label></div>" +
  "<div class='field'><label class='checkbox'><input type='checkbox' name='p"+pNum+"_comingSun' data-name='p"+pNum+"_comingSun'>&nbsp&nbsp&nbsp Breakfast (Sunday, 7/2)</label></div>" +
  "</div></div>" // id group, class box;
  return outStr;
}

function createPage1(whosInvited) {
  // defaults
  const data = {
    inviteID: "ERROR",
    person1: "ERROR",
    p1_comingFri: "",
    p1_comingSat: "ERROR",
    p1_comingSun: "ERROR",
    p1_notComing: "ERROR",
    p1_foodChoice: "",
    p1_allergies: "",
    person2: "",
    p2_comingFri: "",
    p2_comingSat: "",
    p2_comingSun: "",
    p2_notComing: "",
    p2_foodChoice: "",
    p2_allergies: "",
    nKids: ""
  };

  // read through whosInvited
  whosInvited = whosInvited.split(',')
  data.inviteID = whosInvited.shift();
  var isFridayInvite = whosInvited.shift();
  data.person1 = whosInvited[0];
  if (whosInvited.length==2){
    data.person2 = whosInvited[1];
  }  else if (whosInvited.length > 2){
    endError(); return; // for our wedding each invite has max 2 people
  }

  var outStr = "<div id='rsvp-page1'>Great! We found your invitation.<br/><br/>";

  outStr = outStr + "<div id='output'></div>"; // where error messages will go

  outStr = outStr + help_makeAttendCard(1,whosInvited[0],isFridayInvite);
  if (whosInvited.length==2){
    outStr = outStr + help_makeAttendCard(2,whosInvited[1],isFridayInvite);
  }

  outStr = outStr + 
  "<div class='buttons is-centered'>" +
    "<button id='second-button' type='submit' class='button is-link is-medium'>Next...</button>" +
  "</div></div>" // button, id page1;
  
  $("#rsvp-initial").replaceWith(outStr);

  // when button is pressed to go from page 2 to page 3
  $(document).on("click", "#second-button", function() {
    // figure out if attending
    if ($("input[name='yesno1']:checked").val()=="yes"){
      data.p1_notComing = "0";
    } else if ($("input[name='yesno1']:checked").val()=="no") {
      data.p1_notComing = "1";
    } else {
      document.getElementById('output').innerHTML = `
      <div class='notification is-danger'>
      Must select "Yes" or "No" for attendance for all guests.
       </div>`;
       window.scrollTo({ top: 0 });;
       return;
    }
    if (whosInvited.length==2){
      if ($("input[name='yesno2']:checked").val()=="yes"){
        data.p2_notComing = "0";
      } else if ($("input[name='yesno2']:checked").val()=="no") {
        data.p2_notComing = "1";
      } else {
        document.getElementById('output').innerHTML = `
        <div class='notification is-danger'>
        Must select "Yes" or "No" for attendance for all guests.
        </div>`;
        window.scrollTo({ top: 0 });;
        return;
      }
    };
    
    // figure out which boxes were checked
    $("#rsvp-page1 input[type='checkbox']").each(function() {
      var checkbox = $(this);
      var name = checkbox.data("name");
      if (checkbox.prop("checked")) {
        data[name] = "1";
      } else {
        data[name] = "0";
      }
    });

    // check that at least one event is checked for all attending guests
    var p1_blank = ((data.p1_notComing == "0") && ((data.p1_comingFri=="0")||(data.p1_comingFri=="")) && (data.p1_comingSat=="0") && (data.p1_comingSun=="0"));
    var p2_blank = ((data.p2_notComing == "0") && ((data.p2_comingFri=="0")||(data.p2_comingFri=="")) && (data.p2_comingSat=="0") && (data.p2_comingSun=="0"));
    if (p1_blank || p2_blank){
      document.getElementById('output').innerHTML = `
      <div class='notification is-danger'>
      Please select at least one event for each attending guest.
       </div>`;
       window.scrollTo({ top: 0 });;
       return;
    }


    if (((whosInvited.length==1)&&(data.p1_notComing=="1")) ||
    ((whosInvited.length==2)&&(data.p1_notComing=="1")&&(data.p2_notComing=="1"))){
      // guests not coming
      submitForm(data,false);
    } else {
      createPage2(data,whosInvited);
    };
  });

  $(document).ready(function() {
    // enable the checkboxes by default
    $("input[type='checkbox']").prop("disabled", false);

    // listen for changes to the radio buttons
    $("input[name='yesno1']").on("change", function() {
      var selectedValue = $(this).val();
      if (selectedValue === "yes") {
        $("#group1 input[type='checkbox']").prop("disabled", false);
      } else {
        $("#group1 input[type='checkbox']").prop("disabled", true);
        $("#group1 input[type='checkbox']").prop("checked", false);
      }
    });
    // second person checkboxes, if applicable
    $("input[name='yesno2']").on("change", function() {
      var selectedValue = $(this).val();
      if (selectedValue === "yes") {
        $("#group2 input[type='checkbox']").prop("disabled", false);
      } else {
        $("#group2 input[type='checkbox']").prop("disabled", true);
        $("#group2 input[type='checkbox']").prop("checked", false);
      }
    });
  });
} 

// initial logic of the form  -------------------------------------------------------------------
document.getElementById('form').addEventListener('submit', function(event) {
  document.getElementById('timeWarning').innerHTML = "(This may take a few seconds)";
  document.getElementById('output').innerHTML = "";
  document.getElementById('submit-btn').classList.add('is-loading');
    event.preventDefault();
    var name = this.elements.name.value;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://script.google.com/macros/s/AKfycbygC6IgyI5iS0BxbPRd7hTItrtU6wua6BZ8lML5dAqVOwA567fNP4WZbHyB6h2ldBvx/exec?name=' + name, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        document.getElementById('submit-btn').classList.remove('is-loading');
        var idAndNames = xhr.responseText;
        if (idAndNames === "Name not found") {
          document.getElementById('output').innerHTML = `<div class='notification is-danger'>
             Couldn't find that name. Please use the first and last name exactly as it appears on the invitation.
             If there is more than one name on the invitation, please enter ONE of them.
             </div>`;
             document.getElementById('timeWarning').innerHTML = "";
        } else if (idAndNames === "Already RSVPd"){
          document.getElementById('output').innerHTML = `<div class='notification is-danger'>
              We already have an RSVP for your name! If that seems wrong, please contact Molly and Alik at mollyandalik@gmail.com, or send them a text!
             </div>`;
             document.getElementById('timeWarning').innerHTML = "";
        } else {
          createPage1(idAndNames)
        }
      }
    };
    xhr.send();
  });
