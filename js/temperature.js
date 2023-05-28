
function initTemp()
{
	xmlMain = loadXML("xml/temperature.xml");
	if (!xmlMain) {
		document.write("<p>获取分度表信息失败！请退回重试！</p>");
		return;
	}
	
	var tempList = document.getElementById("selectTemp");
	
	var cls = xmlMain.getElementsByTagName("class");
	var y;
	for (var i = 0; i < cls.length; i++) {
		y = document.createElement('option');
		y.text = cls[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
		tempList.add(y);
	}
	
	loadTempInfo();
	
	changeType();
}

function loadTempInfo()
{
	var i = parseInt(getCookie("selectTemp"));
	if (i !== i) {
		i = 0;
	}
	document.getElementById("selectTemp").selectedIndex = i;
}

function saveTempInfo()
{
	setCookie("temp", document.getElementById("selectTemp").selectedIndex);
}

function changeType()
{
	var tempList = document.getElementById("selectTemp");
	
	switch(xmlMain.getElementsByTagName("class")[document.getElementById("selectTemp").selectedIndex].getElementsByTagName("type")[0].childNodes[0].nodeValue)
	{
	case 'rtd':
		document.getElementById("coldP").style.display = "none";
		document.getElementById("tempUnit").innerHTML = "请输入要查询的值（单位：" + (document.getElementById("a").checked ? "Ω" : "℃") + "）：";
		break;
		
	case 'tc':
		document.getElementById("coldP").style.display = "";
		document.getElementById("tempUnit").innerHTML = "请输入要查询的值（单位：" + (document.getElementById("a").checked ? "mV" : "℃") + "）：";
		break;
	}
}

function beginTemp()
{
	var result = 0;
	var dir = document.getElementById("a").checked;
	var typeT = 0;
	
	switch(xmlMain.getElementsByTagName("class")[document.getElementById("selectTemp").selectedIndex].getElementsByTagName("type")[0].childNodes[0].nodeValue)
	{
	case 'rtd':
		result = calcRTD(dir);
		typeT = 0;
		break;
		
	case 'tc':
		result = calcTc(dir);
		typeT = 1;
		break;
	}
	
	if (result !== result) {
		document.getElementById("result").innerHTML = "未输入或超出范围！";
	}
	else {
		if (dir) {
			document.getElementById("result").innerHTML = "温度为：" + decimalCut(result, 4) + "℃";
		}
		else {
			document.getElementById("result").innerHTML = "测量值为：" + decimalCut(result, 4) + (typeT ? "mV" : "Ω");
		}
	}
}

function calcRTD(dir)
{
	var tempTable = xmlMain.getElementsByTagName("class")[document.getElementById("selectTemp").selectedIndex].getElementsByTagName("item");
	var raw = parseFloat(document.getElementById("raw").value);
	
	if (dir) {
		var minR = parseFloat(tempTable[0].getElementsByTagName("r")[0].childNodes[0].nodeValue);
		var maxR = parseFloat(tempTable[tempTable.length - 1].getElementsByTagName("r")[0].childNodes[0].nodeValue);
		if (raw !== raw || raw < minR || raw > maxR) {
			return NaN;
		}
		
		var nextT = 0, preT = 0;
		var nextR = minR, preR = minR;
		for (var i = 0; i < tempTable.length; i++) {
			nextR = parseFloat(tempTable[i].getElementsByTagName("r")[0].childNodes[0].nodeValue);
			if (preR <= raw && nextR > raw) {
				nextT = parseFloat(tempTable[i].getElementsByTagName("t")[0].childNodes[0].nodeValue);
				preT = parseFloat(tempTable[i - 1].getElementsByTagName("t")[0].childNodes[0].nodeValue);
				break;
			}
			
			preR = nextR;
		}
		
		if (i == tempTable.length) {
			return NaN;
		}
		
		return ((nextT - preT) / (nextR - preR) * (raw - preR) + preT);
	}
	else {
		var minT = parseFloat(tempTable[0].getElementsByTagName("t")[0].childNodes[0].nodeValue);
		var maxT = parseFloat(tempTable[tempTable.length - 1].getElementsByTagName("t")[0].childNodes[0].nodeValue);
		if (raw !== raw || raw < minT || raw > maxT) {
			return NaN;
		}
		
		var nextT = minT, preT = minT;
		var nextR = 0, preR = 0;
		for (var i = 0; i < tempTable.length; i++) {
			nextT = parseFloat(tempTable[i].getElementsByTagName("t")[0].childNodes[0].nodeValue);
			if (preT <= raw && nextT > raw) {
				nextR = parseFloat(tempTable[i].getElementsByTagName("r")[0].childNodes[0].nodeValue);
				preR = parseFloat(tempTable[i - 1].getElementsByTagName("r")[0].childNodes[0].nodeValue);
				break;
			}
			
			preT = nextT;
		}
		
		if (i == tempTable.length) {
			return NaN;
		}
		
		return ((nextR - preR) / (nextT - preT) * (raw - preT) + preR);
	}
}

function calcTc(dir)
{
	var tempTable = xmlMain.getElementsByTagName("class")[document.getElementById("selectTemp").selectedIndex].getElementsByTagName("item");
	var raw = parseFloat(document.getElementById("raw").value);
	var coldT = parseFloat(document.getElementById("cold").value);
	
	var minE = parseFloat(tempTable[0].getElementsByTagName("e")[0].childNodes[0].nodeValue);
	var maxE = parseFloat(tempTable[tempTable.length - 1].getElementsByTagName("e")[0].childNodes[0].nodeValue);
	var minT = parseFloat(tempTable[0].getElementsByTagName("t")[0].childNodes[0].nodeValue);
	var maxT = parseFloat(tempTable[tempTable.length - 1].getElementsByTagName("t")[0].childNodes[0].nodeValue);
	
	if (raw !== raw || coldT < minT || coldT > maxT) {
		return NaN;
	}
	else if (coldT !== coldT) {
		coldT = 0;
	}
	
	if (dir) {
		if (raw < minE || raw > maxE) {
			return NaN;
		}
		
		// 求出冷端温度对应的热电势
		var nextT = minT, preT = minT;
		var nextE = 0, preE = 0;
		for (var i = 0; i < tempTable.length; i++) {
			nextT = parseFloat(tempTable[i].getElementsByTagName("t")[0].childNodes[0].nodeValue);
			if (preT <= coldT && nextT > coldT) {
				nextE = parseFloat(tempTable[i].getElementsByTagName("e")[0].childNodes[0].nodeValue);
				preE = parseFloat(tempTable[i - 1].getElementsByTagName("e")[0].childNodes[0].nodeValue);
				break;
			}
			
			preT = nextT;
		}
		if (i == tempTable.length) {
			return NaN;
		}
		var coldE = (nextE - preE) / (nextT - preT) * (coldT - preT) + preE;
		var hotE = coldE + raw;
		
		// 查表求出热端温度
		nextT = 0;
		preT = 0;
		nextE = minE;
		preE = minE;
		for (var i = 0; i < tempTable.length; i++) {
			nextE = parseFloat(tempTable[i].getElementsByTagName("e")[0].childNodes[0].nodeValue);
			if (preE <= hotE && nextE > hotE) {
				nextT = parseFloat(tempTable[i].getElementsByTagName("t")[0].childNodes[0].nodeValue);
				preT = parseFloat(tempTable[i - 1].getElementsByTagName("t")[0].childNodes[0].nodeValue);
				break;
			}
			
			preE = nextE;
		}
		if (i == tempTable.length) {
			return NaN;
		}
		
		return ((nextT - preT) / (nextE - preE) * (hotE - preE) + preT);
	}
	else {
		if (raw < minT || raw > maxT) {
			return NaN;
		}
		
		// 求出冷端温度和热端温度对应的热电势
		var nextT = minT, preT = minT;
		var nextE = 0, preE = 0;
		for (var i = 0; i < tempTable.length; i++) {
			nextT = parseFloat(tempTable[i].getElementsByTagName("t")[0].childNodes[0].nodeValue);
			if (preT <= coldT && nextT > coldT) {
				nextE = parseFloat(tempTable[i].getElementsByTagName("e")[0].childNodes[0].nodeValue);
				preE = parseFloat(tempTable[i - 1].getElementsByTagName("e")[0].childNodes[0].nodeValue);
				break;
			}
			
			preT = nextT;
		}
		if (i == tempTable.length) {
			return NaN;
		}
		var coldE = (nextE - preE) / (nextT - preT) * (coldT - preT) + preE;
		
		nextT = minT;
		preT = minT;
		nextE = 0;
		preE = 0;
		for (var i = 0; i < tempTable.length; i++) {
			nextT = parseFloat(tempTable[i].getElementsByTagName("t")[0].childNodes[0].nodeValue);
			if (preT <= raw && nextT > raw) {
				nextE = parseFloat(tempTable[i].getElementsByTagName("e")[0].childNodes[0].nodeValue);
				preE = parseFloat(tempTable[i - 1].getElementsByTagName("e")[0].childNodes[0].nodeValue);
				break;
			}
			
			preT = nextT;
		}
		if (i == tempTable.length) {
			return NaN;
		}
		var hotE = (nextE - preE) / (nextT - preT) * (raw - preT) + preE;
		
		return (hotE - coldE);
	}
}