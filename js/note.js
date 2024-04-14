
var noteList = new Array();

var page = 0;
var itemsPerPage = 100;

function initNote()
{
	xmlMain = loadXML("xml/note.xml");
	if (!xmlMain) {
		document.write("<p>获取文档信息失败！请退回重试！</p>");
		return;
	}
	
	makeFind("");
}

function makeFind(findStr)
{
	noteList.splice(0, noteList.length);
	
	var item;
	var title, text, img;
	var list = xmlMain.getElementsByTagName("item");

	for (var i = 0; i < list.length; i++) {
		title = list[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
		// 若当前条目中包含所搜索的字段，则text为值，否则为null
		text = newText(list[i], findStr);
		if (!text) {
			continue;
		}
		
		item = new Object();
		item.title = title;
		item.text = text;
		item.img = "";
		if (list[i].getElementsByTagName("img").length) {
			item.img = list[i].getElementsByTagName("img")[0].childNodes[0].nodeValue;
		}
		
		noteList.push(item);
	}
	
	page = 0;
	document.getElementById("pre").style.display = "none";
	if (noteList.length <= 10) {
		document.getElementById("next").style.display = "none";
	}
	else {
		document.getElementById("next").style.display = "";
	}
	
	refreshShow();
}

function newText(item, findStr)
{
	var r = "";
	var count = 0;
	var list = item.getElementsByTagName("text")[0].getElementsByTagName("para");
	
	for (var i = 0; i < list.length; i++) {
		for (var j = 0; j < list.length; j++) {
			if (parseInt(list[j].getAttributeNode("idx").nodeValue) == i) {
				break;
			}
		}
		if (j == list.length) {
			break;
		}
		
		if (findStr && findStr.length) {
			if (list[j].childNodes[0].nodeValue.toUpperCase().indexOf(findStr.toUpperCase()) >= 0) {
				count++;
			}
		}
		else {
			count++;
		}
		
		if (!list[j].childNodes.length) {
			break;
		}
		r += "<p>";
		if (list[j].getAttributeNode("bold")) {
			r += "<b>";
		}
		r += list[j].childNodes[0].nodeValue;
		r += "</p>";
		if (list[j].getAttributeNode("bold")) {
			r += "</b>";
		}
	}
	
	list = item.getElementsByTagName("key");
	for (var i = 0; i < list.length; i++) {
		if (list[i].childNodes[0].nodeValue.toUpperCase().indexOf(findStr.toUpperCase()) >= 0) {
			count++;
			break;
		}
	}
	
	if (!count && item.getElementsByTagName("title")[0].childNodes[0].nodeValue.toUpperCase().indexOf(findStr.toUpperCase()) < 0) {
		return null;
	}
	else {
		return r;
	}
}

function findStart()
{
	document.getElementsByClassName("findblock")[0].style.display = "";
	document.getElementById("find").select();
}

function endFind()
{
	document.getElementsByClassName("findblock")[0].style.display = "none";
}

function findString()
{
	var findStr = document.getElementById("find").value;
	makeFind(findStr);
}

function refreshShow()
{
	var index = page * itemsPerPage;
	var str = "", i;
	for (i = 0; i < itemsPerPage; i++) {
		if (page * itemsPerPage + i >= noteList.length) {
			break;
		}
		
		str += '<hr id="hr' + i + '" style="margin-bottom:0;" />';
		str += '<h4 id="h' + i + '" class="notetitle" onclick="openClose(' + i + ')"></h4><img id="img' + i + '" src="" style="display:none;"></img><div id="div' + i + '" class="small" style="display:none;"></div>';
	}
	str += '<hr id="hr' + i + '" style="margin-bottom:0;" />';
	document.getElementById("notelist").innerHTML = str;
	
	for (i = 0; i < itemsPerPage; i++) {
		if (page * itemsPerPage + i >= noteList.length) {
			break;
		}
		
		document.getElementById("hr" + i).style.display = "";
		
		document.getElementById("h" + i).innerHTML = noteList[page * itemsPerPage + i].title;
		document.getElementById("h" + i).style.display = "";
		
		document.getElementById("img" + i).src = noteList[page * itemsPerPage + i].img;
		document.getElementById("img" + i).style.display = "none";
		
		document.getElementById("div" + i).innerHTML = noteList[page * itemsPerPage + i].text;
		document.getElementById("div" + i).style.display = "none";
	}
	
	if (i < itemsPerPage) {
		if (i == 0) {
			document.getElementById("hr" + i).style.display = "";
		
			document.getElementById("h" + i).innerHTML = "找不到任何结果！";
			document.getElementById("h" + i).style.display = "";
			
			document.getElementById("img" + i).style.display = "none";
			
			document.getElementById("div" + i).innerHTML = "";
			document.getElementById("div" + i).style.display = "none";
			
			i++;
		}
		document.getElementById("hr" + i).style.display = "";
	}
	else {
		document.getElementById("hr" + i).style.display = "";
	}
	document.getElementById("index").innerHTML = "第" + (page + 1) + "页，共" + Math.max(1, Math.ceil(noteList.length / itemsPerPage)) + "页";
	
	if (page <= 0) {
		document.getElementById("pre").style.display = "none";
	}
	else {
		document.getElementById("pre").style.display = "";
	}
	
	if ((page + 1) * itemsPerPage >= noteList.length) {
		document.getElementById("next").style.display = "none";
	}
	else {
		document.getElementById("next").style.display = "";
	}
	
	window.scrollTo(0, 0);
}

function openClose(idx)
{
	var item = document.getElementById("div" + idx);
	if (item.style.display.length) {
		document.getElementById("div" + idx).style.display = "";
		if (noteList[page * 10 + idx].img.length > 0) {
			document.getElementById("img" + idx).style.display = "";
		}
		
		item = document.getElementById("hr" + idx);
		window.scrollTo(0, item.offsetTop - 5);
	}
	else {
		document.getElementById("div" + idx).style.display = "none";
		document.getElementById("img" + idx).style.display = "none";
	}
}

function prePage()
{
	page--;
	if (page <= 0) {
		page = 0;
	}
	
	refreshShow();
}

function nextPage()
{
	page++;
	if ((page + 1) * 10 >= noteList.length) {
		page = Math.ceil(noteList.length / 10) - 1;
	}
	
	refreshShow();
}

function jumpPage()
{
	var pageText = document.getElementById("jumpIndex").value;
	if (!pageText || !pageText.length) {
		return;
	}
	
	page = parseInt(pageText);
	page = Math.max(1, Math.min(page, Math.ceil(noteList.length / 10))) - 1;
	
	document.getElementById("jumpIndex").value = "";
	
	refreshShow();
}