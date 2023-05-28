
var checkList = new Array();

function initTest()
{
	xmlMain = loadXML("xml/test.xml");
	if (!xmlMain) {
		document.write("<p>获取校验信息失败！请退回重试！</p>");
		return;
	}
	
	var typeList = document.getElementById("selectType");
	
	var cls = xmlMain.getElementsByTagName("class");
	var y;
	for (var i = 0; i < cls.length; i++) {
		y = document.createElement('option');
		y.text = cls[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
		typeList.add(y);
	}
	
	changeTest(true);
}

function loadTestInfo(idx)
{
	switch(idx)
	{
	case 0:
		var i = parseInt(getCookie("type"));
		if (i !== i) {
			i = 0;
		}
		document.getElementById("selectType").selectedIndex = i;
		break;
		
	case 1:
		i = parseInt(getCookie("precistion"));
		if (i !== i) {
			i = getDefSel();
		}
		document.getElementById("selectPrecision").selectedIndex = i;
		break;
	}
}

function saveTestInfo()
{
	setCookie("type", document.getElementById("selectType").selectedIndex);
	setCookie("precistion", document.getElementById("selectPrecision").selectedIndex);
}

function changeTest(init)
{
	var typeList = document.getElementById("selectType");
	var preciList = document.getElementById("selectPrecision");
	
	for (var i = preciList.length - 1; i >= 0; i--)
	{
		preciList.remove(i);
	}
	
	if (init) {
		loadTestInfo(0);
	}
	
	var cls = xmlMain.getElementsByTagName("class")[typeList.selectedIndex];
	var preci = cls.getElementsByTagName("item");
	for (var i = 0; i < preci.length; i++) {
		y = document.createElement('option');
		y.text = preci[i].getElementsByTagName("precision")[0].childNodes[0].nodeValue;
		preciList.add(y);
	}
	
	if (init) {
		loadTestInfo(1);
	}
	else {
		preciList.selectedIndex = getDefSel();
	}
	
	switch(cls.getElementsByTagName("type")[0].childNodes[0].nodeValue)
	{
	case "ptrans":
	case "pscale":
		document.getElementById("setP").style.display = "none";
		break;
		
	case "pctrl":
		document.getElementById("setP").style.display = "";
		break;
	}
}

function getDefSel()
{
	var typeList = document.getElementById("selectType");
	var sel = xmlMain.getElementsByTagName("class")[typeList.selectedIndex].getElementsByTagName("defsel");
	if (sel.length) {
		return parseInt(sel[0].childNodes[0].nodeValue);
	}
	else {
		return 0;
	}
}

function beginTest()
{
	var typeList = document.getElementById("selectType");
	
	var cls = xmlMain.getElementsByTagName("class")[typeList.selectedIndex];
	switch(cls.getElementsByTagName("type")[0].childNodes[0].nodeValue)
	{
	case "ptrans":
		showPTrans(cls);
		break;
		
	case "pscale":
		showPScale(cls);
		break;
		
	case "pctrl":
		showPCtrl(cls);
		break;
	}
	
	saveTestInfo();
}

function showPTrans(cls)
{
	var preciIdx = document.getElementById("selectPrecision").selectedIndex;
	var item = cls.getElementsByTagName("item")[preciIdx];
	var i, index = 0;
	
	var str = "<tr class='alt'><th>项目</th><th>数值</th></tr>";
	
	// 温度湿度
	str += addLine(index) + "<td class='rgt'>环境温度</td><td>";
	str += item.getElementsByTagName("t")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	str += addLine(index) + "<td class='rgt'>相对湿度</td><td>";
	str += item.getElementsByTagName("h")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	str += addLine(index) + "<td class='rgt'>绝缘电阻</td><td>";
	str += item.getElementsByTagName("r")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	
	// 标准表精度下限
	str += addLine(index) + "<td class='rgt'>标准表最低精度</td><td>";
	i = parseFloat(item.getElementsByTagName("std")[0].childNodes[0].nodeValue);
	str += decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) / i, 6);
	str += "</td></tr>";
	index++;
	
	// 最大允许误差
	str += addLine(index) + "<td class='rgt'>最大允许误差</td><td>";
	str += "±" + decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * 16 / 100, 6);
	str += "</td></tr>";
	index++;
	
	// 回程误差
	str += addLine(index) + "<td class='rgt'>首检回程误差（常用）</td><td>";
	str += decimalCut(parseFloat(item.getElementsByTagName("hystere")[0].childNodes[0].nodeValue) * 16 / 100, 6);
	str += "</td></tr>";
	index++;
	str += addLine(index) + "<td class='rgt'>续检回程误差</td><td>";
	str += decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * 16 / 100, 6);
	str += "</td></tr>";
	index++;
	
	// 检定点
	var down = parseFloat(document.getElementById("down").value);
	if (down !== down) {
		down = 0;
	}
	var up = parseFloat(document.getElementById("up").value);
	if (up !== up || up <= down) {
	}
	else {
		var range = up - down;
		
		calcCheckPoint(item, range, down);
		for (i = 0; i < checkList.length; i++) {
			str += addLine(index) + "<td class='rgt'>检定点[" + (i + 1) + "]</td><td>";
			str += decimalCut(checkList[i], 4);
			str += "</td></tr>";
			index++;
		}
	}
	
	setTableInnerHTML(document.getElementById("result"), str);
}

function showPScale(cls)
{
	var preciIdx = document.getElementById("selectPrecision").selectedIndex;
	var item = cls.getElementsByTagName("item")[preciIdx];
	var i, index = 0;
	
	var str = "<tr class='alt'><th>项目</th><th>数值</th></tr>";
	
	// 温度湿度
	str += addLine(index) + "<td class='rgt'>环境温度</td><td>";
	str += item.getElementsByTagName("t")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	str += addLine(index) + "<td class='rgt'>相对湿度</td><td>";
	str += item.getElementsByTagName("h")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	str += addLine(index) + "<td class='rgt'>绝缘电阻</td><td>";
	str += item.getElementsByTagName("r")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	
	// 标准表精度下限
	str += addLine(index) + "<td class='rgt'>标准表最低精度</td><td>";
	i = parseFloat(item.getElementsByTagName("std")[0].childNodes[0].nodeValue);
	str += decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) / i, 6);
	str += "</td></tr>";
	index++;
	
	var down = parseFloat(document.getElementById("down").value);
	if (down !== down) {
		down = 0;
	}
	var up = parseFloat(document.getElementById("up").value);
	if (up !== up || up <= down) {
		document.getElementById("result").innerHTML = str;
		return;
	}
	var range = up - down;
	
	// 最大允许误差
	str += addLine(index) + "<td class='rgt'>最大允许误差</td><td>";
	str += "±" + decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * range / 100, 6);
	str += "</td></tr>";
	index++;
	if (item.getElementsByTagName("maxe").length) {
		str += addLine(index) + "<td class='rgt'>90%量程以上允许误差</td><td>";
		str += "±" + decimalCut(parseFloat(item.getElementsByTagName("maxe")[0].childNodes[0].nodeValue) * range / 100, 6);
		str += "</td></tr>";
		index++;
	}
	
	// 回程误差
	str += addLine(index) + "<td class='rgt'>回程误差</td><td>";
	str += decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * range / 100, 6);
	str += "</td></tr>";
	index++;
	
	// 轻敲位移
	str += addLine(index) + "<td class='rgt'>轻敲位移</td><td>";
	str += decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * range / 200, 6);
	str += "</td></tr>";
	index++;
	
	// 检定点
	calcCheckPoint(item, range, down)
	for (i = 0; i < checkList.length; i++) {
		str += addLine(index) + "<td class='rgt'>检定点[" + (i + 1) + "]</td><td>";
		str += decimalCut(checkList[i], 4);
		str += "</td></tr>";
		index++;
	}
	
	setTableInnerHTML(document.getElementById("result"), str);
}

function showPCtrl(cls)
{
	var preciIdx = document.getElementById("selectPrecision").selectedIndex;
	var item = cls.getElementsByTagName("item")[preciIdx];
	var i, index = 0;
	
	var str = "<tr class='alt'><th>项目</th><th>数值</th></tr>";
	
	// 温度湿度
	str += addLine(index) + "<td class='rgt'>环境温度</td><td>";
	str += item.getElementsByTagName("t")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	str += addLine(index) + "<td class='rgt'>相对湿度</td><td>";
	str += item.getElementsByTagName("h")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	str += addLine(index) + "<td class='rgt'>绝缘电阻</td><td>";
	str += item.getElementsByTagName("r")[0].childNodes[0].nodeValue;
	str += "</td></tr>";
	index++;
	
	// 标准表精度下限
	str += addLine(index) + "<td class='rgt'>标准表最低精度</td><td>";
	i = parseFloat(item.getElementsByTagName("std")[0].childNodes[0].nodeValue);
	str += decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) / i, 6);
	str += "</td></tr>";
	index++;
	
	var down = parseFloat(document.getElementById("down").value);
	if (down !== down) {
		down = 0;
	}
	var up = parseFloat(document.getElementById("up").value);
	if (up !== up || up <= down) {
		document.getElementById("result").innerHTML = str;
		return;
	}
	var range = up - down;
	
	// 设定点允许误差
	str += addLine(index) + "<td class='rgt'>设定点允许误差</td><td>";
	str += "±" + decimalCut(parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * range / 100, 6);
	str += "</td></tr>";
	index++;
	
	// 重复性误差
	str += addLine(index) + "<td class='rgt'>重复性误差限</td><td>";
	str += decimalCut(parseFloat(item.getElementsByTagName("repeate")[0].childNodes[0].nodeValue) * range / 100, 6);
	str += "</td></tr>";
	index++;
	
	// 切换差
	str += addLine(index) + "<td class='rgt'>切换差</td><td>";
	str += decimalCut(10 * range / 100, 6);
	str += "</td></tr>";
	index++;
	
	var set = parseFloat(document.getElementById("stop").value);
	if (set !== set) {
	}
	else {
		var low, high;
		
		// 设定点允许误差
		low = set - parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * range / 100;
		if (low < down) {
			low = down;
		}
		high = set + parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * range / 100;
		if (high > up) {
			high = up;
		}
		str += addLine(index) + "<td class='rgt'>动作限值</td><td>";
		str += decimalCut(low, 6);
		str += "~" + decimalCut(high, 6);
		str += "</td></tr>";
		index++;
		
		// 切换差
		low = set - 10 * range / 100;
		if (low < down) {
			low = down;
		}
		str += addLine(index) + "<td class='rgt'>下切换恢复限值</td><td>";
		str += decimalCut(low, 6) + "~" + set;
		str += "</td></tr>";
		index++;
		
		high = set + 10 * range / 100;
		if (high > up) {
			high = up;
		}
		str += addLine(index) + "<td class='rgt'>上切换恢复限值</td><td>";
		str += set + "~" + decimalCut(high, 6);
		str += "</td></tr>";
		index++;
	}
	
	setTableInnerHTML(document.getElementById("result"), str);
}

function calcCheckPoint(item, range, down)
{
	checkList.splice(0, checkList.length);
	
	var i, j = parseInt(item.getElementsByTagName("pt")[0].childNodes[0].nodeValue);
	var countA = 0, countB = 0; // 小数位数超过3位的数目
	
	countA = decimalCount(range / (j - 1));
	countB = decimalCount(range / j);
	
	if (countA > 3 && countB < countA) {
		j++;
	}
	
	for (i = 0; i < j; i++) {
		checkList[i] = range / (j - 1) * i + down;
	}
}

function addLine(index)
{
	if (index % 2) {
		return "<tr class='alt'>";
	}
	else {
		return "<tr>";
	}
}