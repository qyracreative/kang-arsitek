/**
 * GOOGLE APPS SCRIPT BACKEND FOR KANG ARSITEK PROMPT GENERATOR
 * 
 * Deployment Instructions:
 * 1. Create a Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code and Save.
 * 4. Click Deploy > New Deployment.
 * 5. Type: Web App | Execute as: Me | Access: Anyone.
 * 6. Copy the URL and paste it into your VITE_GOOGLE_SCRIPT_URL.
 */

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Projects");
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet("Projects");
    sheet.appendRow([
      "Project ID", "Title", "Character", "Location", "Building", 
      "Weather", "Theme", "Status", 
      "Scene1", "Scene2", "Scene3", "Scene4", 
      "Scene5", "Scene6", "Scene7", "Scene8", 
      "Created At"
    ]);
    sheet.getRange(1, 1, 1, 17).setFontWeight("bold").setBackground("#f3f3f3");
    sheet.setFrozenRows(1);
  }

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Invalid JSON" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var projectId = data.projectId;
  var action = data.action;

  if (action === "saveProject") {
    saveOrUpdateProject(sheet, data);
  } else if (action === "updateStatus") {
    updateProjectStatus(sheet, projectId, data.status);
  }

  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function saveOrUpdateProject(sheet, data) {
  var rows = sheet.getDataRange().getValues();
  var rowIndex = -1;

  // Check if project already exists
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == data.projectId) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    data.projectId,
    data.title,
    data.character,
    data.location,
    data.building,
    data.weather,
    data.theme,
    data.status,
    data.scene1,
    data.scene2,
    data.scene3,
    data.scene4,
    data.scene5,
    data.scene6,
    data.scene7,
    data.scene8,
    data.createdAt
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, 17).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function updateProjectStatus(sheet, projectId, status) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == projectId) {
      sheet.getRange(i + 1, 8).setValue(status); // Column 8 is Status
      break;
    }
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Projects");
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var results = [];

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    
    // Custom mapping to match frontend Project type
    obj.id = String(row[0]);
    obj.title = String(row[1]);
    obj.character = String(row[2]);
    obj.location = String(row[3]);
    obj.building = String(row[4]);
    obj.weather = String(row[5]);
    obj.theme = String(row[6]);
    obj.status = String(row[7]);
    
    // Reconstruct prompts array
    obj.prompts = [];
    for (var j = 1; j <= 8; j++) {
      var content = row[j + 7]; // Scene1 starts at column index 8
      if (content) {
        obj.prompts.push({
          id: j,
          title: "Scene " + j,
          content: String(content)
        });
      }
    }
    
    obj.createdAt = row[16] ? new Date(row[16]).getTime() : Date.now();
    
    results.push(obj);
  }

  return ContentService.createTextOutput(JSON.stringify(results))
    .setMimeType(ContentService.MimeType.JSON);
}
