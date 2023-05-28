
var xmlMain;
var ie = (!+[1,]) ? true : false;

function loadXML(strURL)
{
	if (!strURL)
	{
		return null;
	}
	
	var xmlhttp;
	if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  	xmlhttp = new XMLHttpRequest();
  }
	else
  {// code for IE6, IE5
  	xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  if (!xmlhttp)
  {
  	alert("解析模块不可使用!")
  	return null;
  }
  
	xmlhttp.open("GET", strURL, false);
	xmlhttp.send();
	
	return xmlhttp.responseXML;
}

function setBtnHref(btn)
{
	var url = btn.value;
	if (!url)
	{
		return;
	}
	
	location.href = url;
}

function decimalCut(num, count)
{
	if (Math.floor(num) === num || count < 0) {
		return num;
	}
	else {
		return ("" + parseFloat(num.toFixed(count)));
		var str = num.toFixed(count);
		
		for (var i = str.length - 1; i >= 0; i--) {
			switch(str.charAt(i))
			{
			case '0':
			case '.':
				break;
			
			default:
				return str.slice(0, i + 1);
			}
		}
		
		return null;
	}
}

function decimalCount(num)
{
	var str = num.toString();
	var count = 0;
	
	for (var i = str.length - 1; i >= 0; i--) {
		switch(str.charAt(i))
		{
		case '.':
			return count;
		
		default:
			count++;
			break;
		}
	}
	
	return 0;
}

function setCookie(c_name, value, expirehours)
{
	if (!navigator.cookieEnabled)
	{
		return;
	}
	
	var exdate = new Date();
	exdate.setTime(exdate.getTime() + expirehours * 60 * 60 * 1000);
	document.cookie = c_name + "=" + escape(value) + ((!expirehours) ? "" : (";expires=" + exdate.toGMTString())) + ";path=/";
}

function getCookie(name)
{
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if(arr = document.cookie.match(reg))
	{
		return unescape(arr[2]);
	}
	else
	{
		return null;
	}
}

function delCookie(name)
{
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if(cval)
	{
		document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
	}
}

function setTableInnerHTML(table, html)
{
	if (ie) {
		var temp = table.ownerDocument.createElement('div');
		temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
		if (table.tBodies.length == 0) {
			var tbody = document.createElement("tbody");
			table.appendChild(tbody);
		}
		table.replaceChild(temp.firstChild.firstChild, table.tBodies[0]);
	}
	else {
		table.innerHTML = html;
	}
}