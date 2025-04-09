
var publicNavBarModelNew = {
  lang: "CN",
  userNo: null,
  systemOrigin: "",
  noNeedTitle: !1,
  title: null,
  titleCurrent: null,
  logoutEventEndDo: null,
  isReady: !1,
  loadEnd: null,
  initEnvFlag: !1,
  initEndFlag: !1,
  hasHeader: 0,
  readyEventObj: {},
  initInnerTitleFlag: !1,
  noRefreshPageDo: null,
  switchWindowSize: null,
  loadSuccess: !1,
  workspaceVO: {
      user: {
          permissions: []
      }
  },
  userInfo: null,
  userType: "",
  isLoginInit: !1,
  ssoCount: 0,
  readyBindEvent: function(e, t) {
      if ("function" !== typeof t)
          throw new Error("you can must use a argument type is 'function!'");
      console.log("注册头部渲染事件---" + e),
      this.readyEventObj[e] = t,
      this.initEndFlag && (console.log("执行头部渲染事件---" + e),
      t.apply(this))
  },
  urlParameter: function() {
      var e = {}
        , t = /([^?=&#]+)=([^?=&#]+)/g;
      return location.href.replace(t, (function() {
          var t = arguments[1]
            , n = arguments[2];
          e[t] = n
      }
      )),
      e
  },
  tranPlusLoadEnd: null,
  bindEvent: {
      logoutDo: function() {
          publicNavBarModelNew.initEnvFlag = !1,
          window.location.href = publicNavBarModelNew.getDomain() + `/exp-user-common/api/v1/logout?redirectUrl=${encodeURIComponent(window.location.href)}`,
          this.logoutEventEndDo && this.logoutEventEndDo()
      },
      loginPage: function() {
          console.log("跳转到登录认证"),
          publicNavBarModelNew.isLoginInit ? (console.log("登录已初始化"),
          window.location.href = publicNavBarModelNew.getDomain() + `/exp-user-common/api/v1/logout?redirectUrl=${encodeURIComponent(window.location.href)}`) : (console.log("首次初始化"),
          window.location.href = publicNavBarModelNew.getDomain() + `/exp-user-common/api/v1/login?redirect=${encodeURIComponent(window.location.href)}`)
      },
      changeLanguage: function(e) {
          publicNavBarModelNew.changeLanguage(e)
      }
  },
  init: async function(e) {
      this.title = e && e.title || null,
      this.initInnerTitleFlag = e && e.initInnerTitleFlag || !1,
      this.noNeedTitle = e && e.noNeedTitle || !1,
      this.logoutEventEndDo = e && e.logoutEventEndDo || null,
      this.loadEnd = e && e.loadEnd || null,
      this.noRefreshPageDo = e && e.noRefreshPageDo || null,
      this.tranPlusLoadEnd = e && e.tranPlusLoadEnd || null,
      this.switchWindowSize = e && e.switchWindowSize || null;
      var t = function() {
          setTimeout((function() {
              publicNavBarModelNew.windowIsOrNoFullDo()
          }
          ), 200)
      };
      window.removeEventListener ? window.removeEventListener("resize", t) : window.detachEvent("onresize", t),
      window.addEventListener ? window.addEventListener("resize", t, !1) : window.attachEvent("onresize", t),
      this.isReady || await this.ready(),
      this.initEnvCallBack = function() {
          this.initSystemOrigin(),
          this.initLanguageElement(),
          this.loadPublicNavBarCss(),
          this.initPageUI(),
          this.userInfo && "w3" === this.userInfo.userType && this.loadTranslatePlugin()
      }
      ,
      this.initEnvFlag && this.initEnvCallBack();
      let n = this;
      var i = setInterval(( () => {
          n.ssoCount = n.ssoCount + 1,
          n.httpGet(n.getDomain() + "/exp-user-common/api/v1/only4ssoTimeUpdate"),
          n.ssoCount >= 48e7 && clearInterval(i)
      }
      ), 3e5);
      window.addEventListener("mousemove", (function() {
          n.ssoCount = 0
      }
      ))
  },
  initSystemOrigin: function() {
      let e = location.origin;
      -1 !== e.indexOf("//localhost") || -1 !== e.indexOf("127.0.0.1") ? this.systemOrigin = "//uat-expcloud.huawei.com/expcloud/" : this.systemOrigin = (e || "") + "/expcloud/"
  },
  appendGetMsgScript: function(e, t) {
      var n = document.head || document.getElementsByTagName("head")[0] || document.documentElement
        , i = document.createElement("script");
      i.src = e,
      i.onload = i.onreadystatechange = function(e, a) {
          (a || !i.readyState || /loaded|complete/.test(i.readyState)) && (i.onload = i.onreadystatechange = null,
          n && i.parentNode && n.removeChild(i),
          i = void 0,
          t && t())
      }
      ,
      n.insertBefore(i, n.firstChild)
  },
  ready: async function() {
      this.isReady = !0,
      await this.initCommonSystemEnv()
  },
  windowIsOrNoFullDo: function() {
      document.querySelectorAll("div.navbar_expcloud_header").length > 0 && document.querySelectorAll("div.navbar_expcloud_header")[0].children.length > 0 && document.querySelectorAll("div.navbar_expcloud_header")[0].children[0],
      publicNavBarModelNew.checkFull() ? (document.querySelector("div.navbar_expcloud_header") && publicNavBarModelNew.checkHasHeader() && (document.querySelector("div.navbar_expcloud_header").style.display = "none"),
      publicNavBarModelNew.switchWindowSize && publicNavBarModelNew.switchWindowSize(!0)) : (document.querySelector("div.navbar_expcloud_header") && publicNavBarModelNew.checkHasHeader() && (document.querySelector("div.navbar_expcloud_header").style.display = "block"),
      publicNavBarModelNew.switchWindowSize && publicNavBarModelNew.switchWindowSize(!1))
  },
  launchFullscreen: function(e) {
      e.requestFullscreen ? e.requestFullscreen() : e.mozRequestFullScreen ? e.mozRequestFullScreen() : e.webkitRequestFullscreen ? e.webkitRequestFullscreen() : e.msRequestFullscreen && e.msRequestFullscreen()
  },
  exitFullscreen: function() {
      document.exitFullscreen ? document.exitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitExitFullscreen && document.webkitExitFullscreen()
  },
  checkFull: function() {
      var e = window.fullScreen || document.webkitIsFullScreen;
      void 0 === e && (e = !1);
      var t = (window.outerWidth - 8) / window.innerWidth
        , n = t < .98 || t > 1.02;
      return e || (window.screen.availHeight != window.screen.height && window.outerHeight > window.screen.availHeight ? n ? window.screen.width / window.innerWidth * window.innerHeight >= window.screen.height - 5 : window.innerHeight >= window.outerHeight : window.screen.availWidth != window.screen.width && window.outerWidth > window.screen.availWidth ? n ? window.screen.height / window.innerHeight * window.innerWidth >= window.screen.width - 5 : window.innerWidth >= window.outerWidth : window.screen.availHeight == window.screen.height && window.screen.availWidth == window.screen.width && window.outerWidth + 20 > window.screen.width && (n ? window.screen.width / window.innerWidth * window.innerHeight >= window.screen.height - 5 : window.innerHeight >= window.screen.height - 4))
  },
  initCommonSystemEnv: async function() {
      let e = this;
      this.initEnvFlag = !0;
      let t = e.getDomain() + "/exp-user-common/api/v1/user"
        , n = await this.httpGet(t);
      if (n)
          if (200 === n.status) {
              let e = JSON.parse(n.response);
              "403" == e.code || "401" == e.code || "302" == e.code ? this.bindEvent.loginPage() : (this.loadSuccess = !0,
              this.isLoginInit = !0,
              this.userNo = e.data ? e.data.userAccount : "",
              this.userInfo = e.data,
              this.userType = e.data ? e.data.userType : "",
              window.workName || (window.workName = this.userNo),
              this.cookieSetting.setCookie("userCode", this.userNo))
          } else
              this.bindEvent.loginPage();
      else
          this.bindEvent.loginPage()
  },
  getDomain: function() {
      let e = window.location.host
        , t = "";
      return -1 !== e.indexOf("localhost") ? (t = "//expcloud-sit.huawei.com",
      -1 != e.indexOf("ugtm-sit.huawei.com") && (t = "//ugtm-sit.huawei.com")) : t = -1 != e.indexOf("threecloud.huawei.com") ? "threecloud.huawei.com" === e ? "//expcloud.huawei.com" : -1 != e.indexOf("beta") || -1 != e.indexOf("mirror") ? "//uat-expcloud.huawei.com" : "sit-exp.threecloud.huawei.com" === e ? "//sit-exp.threecloud.huawei.com" : "//expcloud-sit.huawei.com" : "//" + window.location.host,
      t
  },
  checkHasHeader: function() {
      var e = this.urlParameter();
      return !(!e || !("hasHeader"in e)) && ("0" != e["hasHeader"] && "1" == e["hasHeader"])
  },
  initPageUI: function() {
      for (var e in this.createdHeader(),
      this.initTitle(),
      this.shortCutIconChange(),
      this.windowIsOrNoFullDo(),
      ("undefined" === typeof window.event || "historyStateChange" != window.event.type) && this.loadEnd && this.loadSuccess && this.loadEnd(this.outerSystemLang(), this.userNo, this.userInfo),
      this.initEndFlag = !0,
      this.readyEventObj)
          console.log("执行头部渲染事件---" + e),
          this.readyEventObj[e].apply(this);
      window.removeEventListener && window.removeEventListener("historyStateChange", this.hashChangeEventDo),
      window.addEventListener && window.addEventListener("historyStateChange", this.hashChangeEventDo, !1);
      var t = "hashchange";
      window.removeEventListener ? window.removeEventListener(t, this.hashChangeEventDo) : window.detachEvent("on" + t, this.hashChangeEventDo),
      window.addEventListener ? window.addEventListener(t, this.hashChangeEventDo, !1) : window.attachEvent("on" + t, this.hashChangeEventDo)
  },
  hashChangeEventDo: function() {
      publicNavBarModelNew.initPageUI()
  },
  createHeaderLang() {
      let e = [{
          className: "icon5",
          langText: "中文",
          value: "CN"
      }, {
          className: "icon24",
          langText: "English",
          value: "EN"
      }]
        , t = [{
          className: "icon5",
          langText: "中文",
          title: "中文",
          ctype: 0
      }, {
          className: "icon24",
          langText: "English",
          title: "English",
          ctype: 1
      }, {
          className: "icon1",
          langText: "العربية",
          title: "阿拉伯语",
          ctype: 2
      }, {
          className: "icon2",
          langText: "Français",
          title: "法语",
          ctype: 3
      }, {
          className: "icon3",
          langText: "Español",
          title: "西班牙语",
          ctype: 4
      }, {
          className: "icon4",
          langText: "Português",
          title: "葡萄牙语",
          ctype: 5
      }, {
          className: "icon6",
          langText: "Italiano",
          title: "意大利语",
          ctype: 6
      }, {
          className: "icon7",
          langText: "Русский",
          title: "俄语",
          ctype: 7
      }, {
          className: "icon8",
          langText: "Indonesia",
          title: "印尼语",
          ctype: 8
      }, {
          className: "icon9",
          langText: "ไทย",
          title: "泰语",
          ctype: 9
      }, {
          className: "icon10",
          langText: "বাংলাদেশ ভাষা",
          title: "孟加拉语",
          ctype: 10
      }, {
          className: "icon11",
          langText: "Deutsch",
          title: "德语",
          ctype: 11
      }, {
          className: "icon12",
          langText: "日本語",
          title: "日语",
          ctype: 12
      }, {
          className: "icon13",
          langText: "한국어",
          title: "韩语",
          ctype: 13
      }, {
          className: "icon14",
          langText: "Svenska",
          title: "瑞典语",
          ctype: 14
      }, {
          className: "icon15",
          langText: "Polski",
          title: "波兰语",
          ctype: 15
      }, {
          className: "icon16",
          langText: "हिन्दी",
          title: "印地语",
          ctype: 16
      }, {
          className: "icon17",
          langText: "Norsk",
          title: "挪威语",
          ctype: 17
      }, {
          className: "icon18",
          langText: "České",
          title: "捷克语",
          ctype: 18
      }, {
          className: "icon19",
          langText: "Nederlands",
          title: "荷兰语",
          ctype: 19
      }, {
          className: "icon20",
          langText: "Suomi",
          title: "芬兰语",
          ctype: 20
      }, {
          className: "icon21",
          langText: "Dansk",
          title: "丹麦语",
          ctype: 21
      }, {
          className: "icon22",
          langText: "Türk",
          title: "土耳其语",
          ctype: 22
      }, {
          className: "icon23",
          langText: "Română",
          title: "罗马尼亚语",
          ctype: 23
      }]
        , n = '<div class="lang_popper_arrow"></div>'
        , i = "";
      for (let r = 0; r < e.length; r++) {
          let t = e[r];
          i += '<div class="langText" onclick="publicNavBarModelNew.bindEvent.changeLanguage(\'' + t.value + '\')"><span class="lang_icon ' + t.className + '"></span><span hastran="1">' + t.langText + "</span></div>"
      }
      let a = ""
        , o = "";
      if ("w3" === this.userInfo.userType) {
          a = '<div class="dashedLine">以下来自华为翻译</div>';
          for (let e = 0; e < t.length; e++) {
              let n = t[e];
              o += '<div class="langText" onclick="publicNavBarModelNew.transLanguage(' + n.ctype + ')"><span class="lang_icon ' + n.className + '"></span><span hastran="1" title="' + n.title + '">' + n.langText + "</span></div>"
          }
      }
      let l = n + i + a + o;
      return l
  },
  createdHeader: function() {
      this.titleCurrent = this.title && this.title[this.lang] ? this.title[this.lang] : "";
      var e = this.systemOrigin
        , t = "//threecloud.huawei.com";
      -1 !== e.indexOf("uat-expcloud.huawei.com") ? t = "//beta.threecloud.huawei.com" : -1 !== e.indexOf("expcloud-sit.huawei.com") ? t = "//test.threecloud.huawei.com/" : -1 !== e.indexOf("mirror") && (t = "//mirror.threecloud.huawei.com/");
      let n = document.body.getElementsByClassName("navbar_expcloud_header");
      for (var i = 0; i < n.length; i++)
          null != n[i] && n[i].parentNode.removeChild(n[i]);
      let a = '<div  class="navbar_expcloud_header" style="height: 38px;clear: both;display: none;font-size: 14px;"></div>';
      if (a = this.htmlToDom(a),
      document.querySelectorAll("body")[0].insertBefore(a, document.querySelectorAll("body")[0].firstElementChild),
      this.hasHeader = this.checkHasHeader(),
      this.hasHeader) {
          document.querySelector("div.navbar_expcloud_header").style.display = "block";
          let e = null;
          "CN" == this.lang ? (e = "data:image/png;base64,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",
          e = this.getDomain() + "/exparch/commonmodule/navbar/img/logo-cn.svg") : (e = "data:image/png;base64,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",
          e = this.getDomain() + "/exparch/commonmodule/navbar/img/logo-en.svg");
          let n = this.createHeaderLang();
          var o = '<nav class="navbar-exp navbar-default-exp navbar-fixed-top"  style="position: fixed; top: 0px; left: 0px; width: 100%; height: 38px; z-index: 9999;text-align: center;border: none;background-color: #2783fc;-webkit-transition: background-color .5s linear;box-sizing: border-box;clear: both;"><a class="navlogo" target="_blank"  href="' + t + '"><div style="vertical-align: middle;border: 0;width:208px;height:26px;display:inline-block;background:url(' + e + ') no-repeat"></div></a><div style="line-height: 38px;color: #fff;font-weight: bold;font-size: 14px;">' + this.titleCurrent + '</div><div class="header_lang_wrap" style="position: absolute;right:48px;line-height: 38px;z-index: 1;top:0px;cursor: pointer;"><div class="langcls" style="text-align: center;font-size: 10px;height: 22px;line-height:22px;display: inline-block;vertical-align: middle;width: 78px;color: #fff;"><span hastran="1" class="lang_border">Language</span><div class="langList">' + n + "</div>";
          document.querySelector("div.navbar_expcloud_header").innerHTML = o
      }
  },
  gotoThreecloud: function(e) {
      window.open(e)
  },
  loadUEM() {
      let e = publicNavBarModelNew.getDomain();
      var t = `${e}/exparch/commonmodule/navbar/uem.js?v=${Math.random()}`
        , n = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
      let i = document.createElement("script");
      i.src = t,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      i.onload = () => {}
      ,
      n.appendChild(i)
  },
  loadTranslatePlugin() {
      "false" != sessionStorage.getItem("showCtype") && -1 === window.location.href.indexOf("ctype") && localStorage.setItem("_lang_ctype", -1);
      let e = publicNavBarModelNew.getDomain()
        , t = new Date
        , n = String(t.getFullYear()) + (t.getMonth() + 1) + t.getDate();
      var i = `${e}/exparch/commonmodule/navbar/trans.js?v=${n}`
        , a = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
      let o = document.createElement("script");
      o.src = i,
      o.onload = () => {
          window.jamModel.createTranslatePlugin(void 0, !1, (function() {
              window.publicNavBarModelNew.transCallBack.call(window.publicNavBarModelNew)
          }
          ))
      }
      ,
      a.appendChild(o)
  },
  transCallBack() {
      console.log("果酱翻译的js加载完成"),
      this.tranPlusLoadEnd && this.tranPlusLoadEnd()
  },
  loadPublicNavBarCss() {
      if (!this.IsInclude("publicNavBar.css")) {
          let t = publicNavBarModelNew.getDomain()
            , n = new Date
            , i = String(n.getFullYear()) + (n.getMonth() + 1) + n.getDate()
            , a = `${t}/exparch/commonmodule/navbar/publicNavBar.css?v=${i}`;
          var e = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
          let o = document.createElement("link");
          o.rel = "stylesheet",
          o.href = a,
          e.appendChild(o)
      }
  },
  IsInclude(e) {
      for (var t = new RegExp("js$","i").test(e), n = document.getElementsByTagName(t ? "script" : "link"), i = 0; i < n.length; i += 1)
          if (n[i][t ? "src" : "href"].indexOf(e) > 0)
              return !0;
      return !1
  },
  htmlToDom: function(e) {
      let t = new DOMParser
        , n = t.parseFromString(e, "text/html");
      return n.body.firstChild
  },
  initTitle: function() {
      this.changeInnerTitle(this.titleCurrent)
  },
  changeInnerTitle: function(e) {
      this.initInnerTitleFlag || this.noNeedTitle || (this.hasHeader && (document.querySelectorAll("div.navbar_expcloud_header")[0].children[0].children[1].innerHTML = e),
      document.title = e)
  },
  initInnerTitle: function(e) {
      e && ("id"in e && (this.title = e,
      this.createdHeader()),
      this.windowIsOrNoFullDo(),
      this.readyBindEvent("initInnerTitle", (function() {
          publicNavBarModelNew.initInnerTitleFlag = !1,
          publicNavBarModelNew.changeInnerTitle(e[publicNavBarModelNew.lang]),
          publicNavBarModelNew.initInnerTitleFlag = !0
      }
      )))
  },
  shortCutIconChange: function() {
      let e = document.body.getElementsByTagName("link");
      for (n = 0; n < e.length; n++)
          "icon" == e[n].getAttribute("rel") && e[n].parentNode.removeChild(e[n]);
      for (var t = document.getElementsByTagName("link"), n = t.length; n >= 0; n--)
          if (t[n] && null != t[n].getAttribute("type") && null != t[n].getAttribute("rel")) {
              var i = t[n].getAttribute("type")
                , a = t[n].getAttribute("rel");
              "image/x-icon" == i.toLowerCase() && -1 != a.toLowerCase().indexOf("icon") && t[n].parentNode.removeChild(t[n])
          }
      var o = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAi5JREFUOE+tk0tIVHEUxn9nZq7OhIxjBj18tChapGUzI15LorYVUSTUqNO7oJ20iJCgl2IUQS0qCNokKY6Uq9pFID1Qo6vjJPSg2lQQpTljEKndE/fWROkq7CwP5//7Pr7/OcIsS2b5nhmA99HonDyfPlIoB7yAjfBWfZOrQg9Sn6cLzgCkzUgGCCi0gSREdDNKgyhbgv3WfRfwsiHIhB4GVv8FSJuR28AG1amlof6hN86sduH9WkCtqGejoBU3/aUl8cKauYCg+m46YBx4nt9nVWatZrYv2+qLvb4ked+LfvUeBxbVeRAiqCfsAkaj0VKPoXdEKQOuA35gG2A4SirsyD090AwsCS/YtPaZN/gQ5ANl7QslU11Zo2r3AN+AIRUuhHqtrowZblXkKDButFj7ROWWqJz3F8UOIuS4IqLXJG1G0sBkfp8178+Ex8xok6Ct4rP3GCeSV4GRQHF9D6oxxLsSnboCUu0A1BZqC3qt7ixgxDSDPiZHBYaN5gHHWXRv4Zr1nf7FPYh0sry9nqfxCsQedAEqEg31PrGygLQZeQWUGMeTcTHshGu9OLYfxUN5R8idG66Lg7Q5AEchlU0+UxU5osI5UT1gtAxeBj4FimN3UdnlpE75jeRPQP1HFMMBXAQaFVIqnPQoCeBFTvOAs1BVv63DPVSaQMOInAKdD5517jeOVUfOik0jQi4wYRxL7hS/nQA5EyiKHQIKpq3wF2x2s6Kj+/8f079e5w+tPctBOwmZTAAAAABJRU5ErkJggg=="
        , l = "data:image/png;base64,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"
        , r = document.createElement("link");
      r.setAttribute("rel", "SHORTCUT ICON"),
      r.setAttribute("type", "image/x-icon"),
      r.setAttribute("href", -1 !== location.href.indexOf("ugtm") ? l : o),
      document.getElementsByTagName("head")[0].appendChild(r)
  },
  getQueryString: function(e) {
      let t = new RegExp("(^|&)" + e + "=([^&]*)(&|$)","i")
        , n = window.location.search.substr(1).match(t);
      if (null != n)
          return decodeURI(n[2]);
      {
          if (window.location.hash.indexOf("?") < 0)
              return null;
          let e = window.location.hash.split("?")[1].match(t);
          return null != e ? decodeURIComponent(e[2]) : null
      }
  },
  transLanguage(e) {
      if (-1 !== location.href.indexOf("lang=")) {
          let t = this.getQueryString("lang")
            , n = window.location.href.replace("lang=" + t, "ctype=" + e);
          window.location.href = n,
          history.pushState("", "", n),
          history.go(0)
      } else
          window.jamModel.transContent(e)
  },
  changeLanguage: function(lang) {
      function changeUrlArg(url, arg, val) {
          var pattern = arg + "=([^&]*)"
            , replaceText = arg + "=" + val;
          if (-1 === url.indexOf("#/"))
              url = url.match(pattern) ? url.replace(eval("/(" + arg + "=)([^&]*)/gi"), replaceText) : url.match("[?]") ? url + "&" + replaceText : url + "?" + replaceText;
          else if (-1 === url.indexOf("?"))
              url = url.replace("#/", "?" + replaceText + "#/");
          else if (url.match(pattern)) {
              var urlTem = url.split("");
              urlTem.splice(url.indexOf(arg), arg.length + (val + "").length + 1, replaceText),
              url = urlTem.join("")
          } else
              url = url.replace("?", "?" + replaceText + "&");
          return url
      }
      this.lang = lang,
      "CN" == this.lang ? this.cookieSetting.setCookie("langCookie", "cn") : "EN" == this.lang && this.cookieSetting.setCookie("langCookie", "en");
      let href = window.location.href;
      var _url = changeUrlArg(href, "lang", this.outerSystemLang());
      if (this.initCommonSystemEnv(),
      localStorage.setItem("_lang_ctype", -1),
      this.noRefreshPageDo) {
          if (-1 !== _url.indexOf("ctype")) {
              let e = this.getQueryString("ctype");
              _url = _url.replace("ctype=" + e, ""),
              window.location.href = _url,
              history.pushState("", "", _url),
              history.go(0)
          }
          this.changeLanguageByNoRefreshPage()
      } else {
          if (-1 !== _url.indexOf("ctype")) {
              let e = this.getQueryString("ctype");
              _url = _url.replace("ctype=" + e, ""),
              _url = _url.replace("&&", "&")
          }
          window.location.href = _url,
          history.pushState("", "", _url),
          history.go(0)
      }
  },
  changeLanguageByNoRefreshPage: function() {
      this.initPageUI(),
      this.noRefreshPageDo(this.outerSystemLang(), this.userNo, this.userInfo)
  },
  initLanguageElement: function() {
      var e = this.urlParameter()
        , t = "CN";
      e && (e["lang"] || e["locale"] || e["language"]) ? (t = e["locale"],
      e["language"] && (t = e["language"]),
      e["lang"] && (t = e["lang"])) : (t = this.getCookieParam("langCookie"),
      t || (t = "CN")),
      console.log(t, t.toLocaleLowerCase().indexOf("en")),
      t && -1 != t.toLocaleLowerCase().indexOf("en") ? this.lang = "EN" : this.lang = "CN"
  },
  outerSystemLang: function() {
      return "CN" == this.lang ? "cn-ZH" : "en-US"
  },
  getCookieParam: function(e) {
      var t = document.cookie;
      let n = null;
      if (t)
          for (var i = t.split(";"), a = 0; a < i.length; a++) {
              var o = i[a].split("=");
              if (e == o[0].trim()) {
                  n = unescape(o[1].trim());
                  break
              }
          }
      return n
  },
  cookieSetting: {
      setCookie: function(e, t) {
          document.cookie = e + "=" + escape(t) + ";path=/;domain=" + window.location.hostname
      },
      getCookie: function(e) {
          var t, n = new RegExp("(^| )" + e + "=([^;]*)(;|$)");
          // eslint-disable-next-line no-cond-assign
          return (t = document.cookie.match(n)) ? unescape(t[2]) : null
      },
      delCookie: function(e) {
          var t = new Date;
          t.setTime(t.getTime() - 1);
          var n = this.getCookie(e);
          null != n && (document.cookie = e + "=;path=/;domain=" + window.location.hostname + ";expires=" + t.toGMTString())
      },
      clearAllCookie: function() {
          for (var e = document.cookie, t = e.split("; "), n = 0; n < t.length; n++) {
              var i = t[n].split("=");
              i.length > 0 && this.delCookie(i[0])
          }
      }
  },
  httpGet: function(e) {
      let t = e;
      return new Promise(( (e, n) => {
          var i = new XMLHttpRequest;
          i.open("GET", t, !0),
          i.withCredentials = !0,
          i.setRequestHeader("X-Requested-With", "XMLHttpRequest"),
          -1 !== location.href.indexOf("legacyMode=1") && i.setRequestHeader("gatewayType", "mag"),
          i.send(null),
          i.onreadystatechange = function() {
              4 === i.readyState && e(i)
          }
      }
      ))
  }
};
window.publicNavBarModel = publicNavBarModelNew;


<template>
  <div :class="{ 'no-header': !hasHeader }" class="navbar_expcloud_header"></div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { mapActions } from 'pinia';
import { useComStore } from '@/store';
import { getAppUrlParms } from '@/utils';

export default {
  name: 'ExpHeader',
  emits: ['headerloaded'],
  setup() {
    const { locale } = useI18n();
    const setLangCondition = (val) => {
      locale.value = val;
    };
    return {
      setLangCondition,
    };
  },
  data() {
    return {
      hasHeader: false,
    };
  },
  mounted() {
    // 是否隐藏体验云头部导航---在 没有hasHeader 或者 hasHeader=0 需要隐藏  其他情况显示头部
    const params = getAppUrlParms();
    if (!params.hasHeader || (params.hasHeader && params.hasHeader === '0')) {
      this.hasHeader = false;
    } else {
      this.hasHeader = true;
    }
    // 根据路由判断所属页面，对应的导航头名字修改
    const pageNameCn = '招投标销管看板';
    const pageNameEn = 'DataCom Inventory Map';
    // 加载体验云头部导航js+css
    const host = '//expcloud.huawei.com';
    const cssURL = `${host}/expcloud/navBar/css/publicNavBar.css`;
    const cssScript = document.createElement('link');
    cssScript.href = cssURL;
    cssScript.type = 'text/css';
    cssScript.rel = 'stylesheet';
    const jsURL = `${host}/exparch/commonmodule/navbar/publicNavBarV1.js?v=${Math.random()}`;
    const jsScript = document.createElement('script');
    jsScript.src = jsURL;
    jsScript.onload = () => {
      window.publicNavBarModelNew.init({
        // 本页面title
        title: {
          id: 1,
          CN: pageNameCn,
          EN: pageNameEn,
        },

        logoutEventEndDo: () => {
          // isLoadWatermark:false,//无效？没起作用呀，css隐藏了
          // 退出登录触发事件
        },

        /* 头部加载完成触发事件
         * @param lang //当前系统语言 cn-ZH en-US
         * @param userNo//工号
         */
        loadEnd: async (lang, userNo) => {
          if (params.lang === 'en-US' || params.lang === 'en_US' || params.locale === 'en-US' || params.locale === 'en_US') {
            lang = 'en';
          } else {
            lang = 'cn';
          }
          const { uniteCode, productLineCode } = params;
          this.setLangCondition(lang);
          this.setLang(lang);
          this.setUserno(userNo);
          this.setUniteCode(uniteCode);
          this.setProductLineCode(productLineCode);
          uniteCode && (await this.$getVcnByUnicode(uniteCode));
          this.$emit('headerloaded');
        },
        // noRefreshPageDo: (lang, userNo) => {
        //   this.$store.commit('SET_LANG', lang)
        // },
        switchWindowSize: (isFull) => {
          if (this.hasHeader) {
            this.setFull(isFull);
          }
        },
      });
    };
    document.head.appendChild(cssScript);
    document.body.appendChild(jsScript);
  },
  methods: {
    ...mapActions(useComStore, ['setUserno', 'setUserInfo', 'setFull', 'setLang', 'setVcnCode', 'setUniteCode', 'setProductLineCode', 'setDimTypeObject']),
  },
};
</script>

<style scoped>
.no-header {
  height: 0 !important;
  visibility: hidden;
}
</style>
