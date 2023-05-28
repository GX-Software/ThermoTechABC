
var aswList = new Array();
var maxDecimal = 9;

function initUnit()
{
	xmlMain = loadXML("xml/unit.xml");
	if (!xmlMain) {
		document.write("<p>获取单位信息失败！请退回重试！</p>");
		return;
	}
	
	var classList = document.getElementById("selectClass");
	
	var cls = xmlMain.getElementsByTagName("class");
	var y;
	for (var i = 0; i < cls.length; i++) {
		y = document.createElement('option');
		y.text = cls[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
		classList.add(y);
	}
	classList.selectedIndex = 0;
	
	loadUnitInfo();
	changeClass(true);
}

function loadUnitInfo()
{
	var i = parseInt(getCookie("class"));
	if (i !== i) {
		i = 0;
	}
	document.getElementById("selectClass").selectedIndex = i;
	
	i = parseInt(getCookie("unit"));
	if (i !== i) {
		i = 0;
	}
	document.getElementById("selectUnit").selectedIndex = i;
	
	i = getCookie("decimal");
	if (!i) {
		document.getElementById("decimal").value = "";
	}
	else {
		document.getElementById("decimal").value = i;
	}
}

function saveUnitInfo()
{
	setCookie("class", document.getElementById("selectClass").selectedIndex);
	setCookie("unit", document.getElementById("selectUnit").selectedIndex);
	setCookie("decimal", document.getElementById("decimal").value);
}

function changeClass(init)
{
	var classList = document.getElementById("selectClass");
	var unitList = document.getElementById("selectUnit");
	
	for (var i = unitList.length - 1; i >= 0; i--)
	{
		unitList.remove(i);
	}
	
	var unit = xmlMain.getElementsByTagName("class")[classList.selectedIndex].getElementsByTagName("item");
	for (var i = 0; i < unit.length; i++) {
		y = document.createElement('option');
		y.text = unit[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
		unitList.add(y);
	}
	
	if (!init) {
		unitList.selectedIndex = 0;
	}
}

function beginUnit()
{
	aswList.splice(0, aswList.length);
	
	var classList = document.getElementById("selectClass");
	var unitList = document.getElementById("selectUnit");
	
	var raw = parseFloat(document.getElementById("raw").value);
	if (raw !== raw) {
		makeTable();
		return;
	}
	
	var unit = xmlMain.getElementsByTagName("class")[classList.selectedIndex].getElementsByTagName("item");
	
	var read = 0;
	var item = unit[unitList.selectedIndex].getElementsByTagName("offset");
	if (item.length) {
		read = parseFloat(item[0].childNodes[0].nodeValue);
		raw += read;
	}
	item = unit[unitList.selectedIndex].getElementsByTagName("ratio");
	if (item.length) {
		read = parseFloat(item[0].childNodes[0].nodeValue);
		raw *= read;
	}
	item = unit[unitList.selectedIndex].getElementsByTagName("divisor");
	if (item.length) {
		read = parseFloat(item[0].childNodes[0].nodeValue);
		raw /= read;
	}
	item = unit[unitList.selectedIndex].getElementsByTagName("g");
	if (item.length) {
		raw *= 9.80665;
	}
	item = unit[unitList.selectedIndex].getElementsByTagName("ng");
	if (item.length) {
		raw /= 9.80665;
	}
	var com = raw;
	
	for (var i = 0, index = 0; i < unit.length; i++) {
		if (i == unitList.selectedIndex) {
			continue;
		}
		
		raw = com;
		
		item = unit[i].getElementsByTagName("g");
		if (item.length) {
			raw /= 9.80665;
		}
		item = unit[i].getElementsByTagName("ng");
		if (item.length) {
			raw *= 9.80665;
		}
		item = unit[i].getElementsByTagName("ratio");
		if (item.length) {
			read = parseFloat(item[0].childNodes[0].nodeValue);
			raw /= read;
		}
		item = unit[i].getElementsByTagName("divisor");
		if (item.length) {
			read = parseFloat(item[0].childNodes[0].nodeValue);
			raw *= read;
		}
		item = unit[i].getElementsByTagName("offset");
		if (item.length) {
			read = parseFloat(item[0].childNodes[0].nodeValue);
			raw -= read;
		}
		
		aswList[index] = raw;
		index++;
	}
	
	makeTable();
	saveUnitInfo();
}

function makeTable()
{
	var str = "<tr class='alt'><th>单位</th><th>量值</th></tr>";
	var result;
	
	if (aswList.length) {
		var classList = document.getElementById("selectClass");
		var unitList = document.getElementById("selectUnit");
		
		var unit = xmlMain.getElementsByTagName("class")[classList.selectedIndex].getElementsByTagName("item");
		
		var decimal = parseInt(document.getElementById("decimal").value);
		if (decimal !== decimal) {
			decimal = maxDecimal;
			document.getElementById("decimal").value = "";
		}
		else {
			decimal = Math.max(0, Math.min(decimal, maxDecimal));
			document.getElementById("decimal").value = decimal;
		}
		
		for (var i = 0, index = 0; i < unit.length; i++) {
			if (i == unitList.selectedIndex) {
				continue;
			}
			
			str += "<tr";
			if (index % 2) {
				str += " class='alt'";
			}
			str += "><td class='rgt'>";
			str += unit[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
			str += "</td><td>";
			result = decimalCut(aswList[index], decimal);
			if (!result) {
				str += "精度过低";
			}
			else {
				str += decimalCut(aswList[index], decimal);
			}
			str += "</td></tr>";
			
			index++;
		}
	}
	
	setTableInnerHTML(document.getElementById("result"), str);
}

function changeDeci()
{
	makeTable();
}

function changeDeciForIE()
{
	if (ie) {
		changeDeci();
	}
}