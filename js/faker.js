
var checkList = new Array(); // 检定点列表
var prepos = new Array(); // 检定前正向
var preneg = new Array(); // 检定前反向
var donepos = new Array(); // 检定后正向
var doneneg = new Array(); // 检定后反向

function initFake()
{
	xmlMain = loadXML("xml/faker.xml");
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
	
	// 检定点
	var down = parseFloat(document.getElementById("down").value);
	if (down !== down) {
		down = 0;
	}
	var up = parseFloat(document.getElementById("up").value);
	if (up !== up || up <= down) {
		alert("请输入上限压力！");
		return;
	}
	
	calcCheckPoint(item, up - down, down);
	
	var currentint = (20 - 4) / (checkList.length - 1);
	var accepte = parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * 16 / 100;
	var hystere = parseFloat(item.getElementsByTagName("hystere")[0].childNodes[0].nodeValue) * 16 / 100;
	calcFakeList(item);
	
	var str = "<tr class='alt'><th rowspan='2'>检定点</th><th rowspan='2'>对应电量<br/>(mA)</th><th colspan='2'>检定前输出(mA)</th><th colspan='2'>检定后输出(mA)</th><th colspan='2'>基本误差(mA)</th><th rowspan='2'>回程误差<br/>(mA)</th></tr>";
	str += "<tr class='alt'><th>正向</th><th>反向</th><th>正向</th><th>反向</th><th>正向</th><th>反向</th></tr>";
	
	for (i = 0; i < checkList.length; i++) {
		str += addLine(index) + "<td>" + decimalCut(checkList[i], 4) + "</td>";
		str += "<td>" + (4 + currentint * i) + "</td>";
		str += "<td>" + prepos[i].toFixed(3) + "</td>";
		str += "<td>" + preneg[i].toFixed(3) + "</td>";
		str += "<td>" + donepos[i].toFixed(3) + "</td>";
		str += "<td>" + doneneg[i].toFixed(3) + "</td>";
		str += "<td>" + (donepos[i] - (4 + currentint * i)).toFixed(3) + "</td>";
		str += "<td>" + (doneneg[i] - (4 + currentint * i)).toFixed(3) + "</td>";
		str += "<td>" + Math.abs(donepos[i] - doneneg[i]).toFixed(3) + "</td></tr>";
	}
	setTableInnerHTML(document.getElementById("statistic"), str);
	
	var max = NaN, maxh = NaN;
	for (i = 0; i < donepos.length; i++) {
		var e = donepos[i] - (4 + currentint * i);
		if (max !== max || Math.abs(max) < Math.abs(e)) {
			max = e;
		}
		e = doneneg[i] - (4 + currentint * i);
		if (Math.abs(max) < Math.abs(e)) {
			max = e;
		}
		e = Math.abs(donepos[i] - doneneg[i]);
		if (maxh !== maxh || maxh < e) {
			maxh = e;
		}
	}
	str = "<tr class='alt'><th>项目</th><th>允许值<br/>(mA)</th><th>实际最大值<br/>(mA)</th><th>结论</th><th colspan='2'>校前（对应画√）</th></tr><tr><th>基本误差</th><td>";
	str += decimalCut(accepte, 6);
	str += "</td><td>";
	str += decimalCut(max, 6);
	str += "</td><td>合格</td><td rowspan='2'>合格";
	str += document.getElementById("ok").checked ? "√</td><td rowspan='2'>不合格</td></tr>" : "</td><td rowspan='2'>不合格";
	str += document.getElementById("ok").checked ? "</td></tr>" : "√</td></tr>";
	str += "<tr><th>回程变差</th><td>";
	str += decimalCut(hystere, 6);
	str += "</td><td>";
	str += decimalCut(maxh, 6);
	str += "</td><td>合格</td></tr>";
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
		document.getElementById("statistic").innerHTML = str;
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
	
	setTableInnerHTML(document.getElementById("statistic"), str);
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
		document.getElementById("statistic").innerHTML = str;
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
	
	setTableInnerHTML(document.getElementById("statistic"), str);
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

function calcFakeList(item)
{
	prepos.splice(0, prepos.length);
	preneg.splice(0, preneg.length);
	donepos.splice(0, donepos.length);
	doneneg.splice(0, doneneg.length);
	
	var i;
	var accepte = parseFloat(item.getElementsByTagName("accepte")[0].childNodes[0].nodeValue) * 16 / 100;
	var hystere = parseFloat(item.getElementsByTagName("hystere")[0].childNodes[0].nodeValue) * 16 / 100;
	var preok = document.getElementById("ok").checked;
	var linear = document.getElementById("linear").checked;
	var currentint = 16 / (checkList.length - 1);
	var pos, neg;
	
	if (document.getElementById("linear").checked) {
		var start = 4, end = 20;
		if (preok) {
			start += (Math.random() - 0.5) * 2 * accepte * 0.4;
			end += (Math.random() - 0.5) * 2 * accepte * 0.4;
		}
		else {
			if (Math.random() > 0.5) {
				start += (Math.round(Math.random()) * 2 - 1) * (accepte + Math.random() * accepte * 0.2);
				end += (Math.random() - 0.5) * 2 * accepte * 0.4;
			}
			else {
				start += (Math.random() - 0.5) * 2 * accepte * 0.4;
				end += (Math.round(Math.random()) * 2 - 1) * (accepte + Math.random() * accepte * 0.2);
			}
		}
		
		for (i = 0; i < checkList.length; i++) {
			var pt = 4 + currentint * i;
			pos = start + (end - start) / (checkList.length - 1) * i + (Math.random() - 0.5) * 2 * accepte * 0.2;
			neg = start + (end - start) / (checkList.length - 1) * i + (Math.random() - 0.5) * 2 * accepte * 0.2;
			if (Math.abs(pos - neg) > hystere) {
				if (pos > pt) {
					neg = pos - Math.random() * hystere * 0.4;
				}
				else {
					neg = pos + Math.random() * hystere * 0.4;
				}
			}
			prepos.push(parseFloat(pos.toFixed(3)));
			preneg.push(parseFloat(neg.toFixed(3)));
		}
	}
	else {
		var n = 0;
		for (i = 0; i < checkList.length; i++) {
			var pt = 4 + currentint * i;
			if (preok) {
				pos = pt + (Math.random() - 0.5) * 2 * accepte * 0.4;
				neg = pt + (Math.random() - 0.5) * 2 * accepte * 0.4;
				if (Math.abs(pos - neg) > hystere) {
					if (pos > pt) {
						neg = pos - Math.random() * hystere * 0.4;
					}
					else {
						neg = pos + Math.random() * hystere * 0.4;
					}
				}
				prepos.push(parseFloat(pos.toFixed(3)));
				preneg.push(parseFloat(neg.toFixed(3)));
			}
			else {
				pos = pt + (Math.random() - 0.5) * 2 * accepte * 1.2;
				neg = pt + (Math.random() - 0.5) * 2 * accepte * 1.2;
				if (Math.abs(pos - pt) > accepte || Math.abs(neg - pt) > accepte) {
					n++;
				}
				prepos.push(parseFloat(pos.toFixed(3)));
				preneg.push(parseFloat(neg.toFixed(3)));
			}
		}
		
		console.log(n);
		if (!preok && !n) {
			i = Math.round(Math.random() * (checkList.length - 1));
			console.log(i);
			if (Math.random() > 0.5) {
				prepos[i] = (4 + currentint * i) + (Math.round(Math.random()) * 2 - 1) * (accepte + Math.random() * accepte * 0.2);
			}
			else {
				preneg[i] = (4 + currentint * i) + (Math.round(Math.random()) * 2 - 1) * (accepte + Math.random() * accepte * 0.2);
			}
		}
	}
	
	for (i = 0; i < checkList.length; i++) {
		var pt = 4 + currentint * i;
		pos = pt + (Math.random() - 0.5) * 2 * accepte * 0.08;
		neg = pt + (Math.random() - 0.5) * 2 * accepte * 0.08;
		if (Math.abs(pos - neg) > hystere) {
			if (pos > pt) {
				neg = pos - Math.random() * hystere * 0.08;
			}
			else {
				neg = pos + Math.random() * hystere * 0.08;
			}
		}
		donepos.push(parseFloat(pos.toFixed(3)));
		doneneg.push(parseFloat(neg.toFixed(3)));
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