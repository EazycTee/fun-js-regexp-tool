var utils = (function() {
    return {
        // 选择并返回元素，默认下缓存，支持 IE11+
        selectElm: (function() {
            var elms = {};
            return function(selector, reselect) {
                var isId = !selector.search('#');
                reselect = (reselect === true) ? true : false;
                if ((!elms[selector] && isId) || (reselect && isId)) {
                    elms[selector] = document.querySelector(selector);
                } else if ((!elms[selector] && !isId) || (reselect && !isId)) {
                    elms[selector] = document.querySelectorAll(selector);
                }
                return elms[selector];
            }
        })()
    }
})();

var vm = new Vue({
    el: '#main',
    data: {
        regInput: '\\w+',
        regHolder: '',
        regForbidden: [
            '', // 空，无实体
            '(?:)', // 空，无实体
            '^' // 匹配开头，无实体；或可以用来统计行数，需要处理执行match()时的死循环
        ],
        textInput: 'Welcome!'
            + '\n' + 'This is a Regular Expression testing tool base on JavaScript.'
            + '\n' + 'Do modify me, and see what will happen:)'
            + '\n'
            + '\n' + '欢迎！'
            + '\n' + '这是一个使用 JavaScript 实现的正则表达式测试工具。'
            + '\n' + '请修改这里的内容，看看有什么变化：）',
        textPre: '',
        textHolder: '',
        isActive: {
            regFlags: {
                g: true,
                i: true,
                m: true
            }
        },
        hover: '',
        focus: ''
    },
    computed: {
        reg: function() {
            var r;
            if (this.regInput === '') {
                r = new RegExp(this.regHolder, this.flag);
            } else if (this.regForbidden.indexOf(this.regInput) === -1) {
                try {
                    r = new RegExp(this.regInput, this.flag);
                } catch (err) {}
            }
            console.log("reg: ", r);
            return r;
        },
        flag: function() {
            var f = '';
            for (name in this.isActive.regFlags) {
                if (this.isActive.regFlags[name] === true) {
                    f += name;
                }
            }
            return f;
        }
    },
    mounted: function() {
        this.match();
    },
    methods: {
        match: function() {
            if (this.reg !== undefined) {
                var source = this.textInput !== '' ? this.textInput : this.textHolder;
                var flagG = (this.isActive.regFlags.g === true) ? true : false;
                var matched = {
                    str: [],
                    index: [],
                    length: []
                }
                var a, j = 0, lastIndex = -1;

                // 如果正则带有"g"（全局匹配）标识，则循环匹配（匹配完毕时，a为null）；如果没有"g"标识，仅匹配一次。
                while (((a = this.reg.exec(source)) && flagG) || (a && (j === 0) && !flagG)) {
                    if(lastIndex == a.index) {
                        break; // 以防匹配0宽字符时造成死循环
                    } else {
                        matched.str.push(a[0]);
                        matched.index.push(a.index);
                        matched.length.push(a[0].length);
                        lastIndex = a.index;
                        j += 1;
                    }
                }

                var i, track = 0,
                    tag, even = false,
                    result = '';

                // 处理原始字符（转义、加标签、拼接），同步到视图
                for (i = 0; i < matched.str.length; i += 1) {
                    // 转义未匹配的字符，拼接结果
                    result += _.escape(source.slice(track, matched.index[i]));
                    tag = !even ? 'b' : 'i';
                    track = matched.index[i] + matched.length[i];
                    // 转义匹配的字符，用一个标签包裹它以修改样式（高亮），拼接结果
                    result += '<' + tag + '>' + _.escape(source.slice(matched.index[i], track)) + '</' + tag + '>';
                    even = !even;
                }
                result += _.escape(source.slice(track, source.length));
                this.textPre = result;
                this.resizeTextHeight();
            } else {
                this.textPre = _.escape(this.textInput);
            }
        },
        resizeTextHeight: function() {
            elmTextBox = utils.selectElm('.textBox')[0];
            elmTextPre = utils.selectElm('#textPre');
            elmTextBody = utils.selectElm('#textBody');
            elmTextBody.style.height = elmTextPre.scrollHeight + 80 + 'px';
            if (elmTextBody.scrollHeight < elmTextBox.scrollHeight) {
                elmTextBody.style.height = elmTextBox.scrollHeight + 'px';
            }
        },
        matchDebounce: _.debounce(function() {
            this.match();
        }, 200),
        inputText: function() {
            // 先填充<pre>标签，让其改变高度，以解决粘贴大量文字时无法根据<pre>及时调整<textarea>高度的问题
            this.textPre = _.escape(this.textInput);
            this.matchDebounce();
        },
        toggleFlag: function(name) {
            this.isActive.regFlags[name] = !this.isActive.regFlags[name];
            this.matchDebounce();
        },
        boxEnter: function(elmName) {
            this.hover = elmName;
        },
        boxLeave: function(e) {
            this.hover = ''
        }
    }
});