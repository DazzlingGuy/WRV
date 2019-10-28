/*!
 * =====================================================
 * 加载XML文件方法 封装
 * author: rensl
 * =====================================================
 */

var loadXML = function (content) {
    var xmlDoc = null
    if (!window.DOMParser && window.ActiveXObject) {
        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
        xmlDomVersions.forEach(object => {
            try {
                xmlDoc = new ActiveXObject(object);
                xmlDoc.async = false;
                xmlDoc.loadXML(content); //loadXML方法载入xml字符串
                return xmlDoc;
            } catch (e) {
                console.log(`Version ${object} init error.`);
            }
        });
    } else if (window.DOMParser && document.implementation && document.implementation.createDocument) {
        try {
            var domParser = new DOMParser();
            return domParser.parseFromString(content, 'text/xml');
        } catch (e) {
            console.log('Dom parser error.');
        }
    } else {
        return null;
    }
}

export default {
    loadXML: loadXML
}