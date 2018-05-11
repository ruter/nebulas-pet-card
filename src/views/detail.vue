<style scoped>
    .index {
        width: 100%;
    }
    .pet-mt-8 {
        margin-top: 8px;
    }
    .pet-mb-32 {
        margin-bottom: 32px;
    }
    .pet-mb-160 {
        margin-bottom: 160px;
    }
    .pet-avatar {
        border-radius: 50%;
        width: 160px;
        height: 160px;
        padding: 8px;
    }
    .pet-pb-16 {
        padding-bottom: 16px;
    }
    .pet-pt-16 {
        padding-top: 16px;
    }
    .text-right {
        text-align: right;
    }
    .text-left {
        text-align: left;
    }
    p.text-right {
        margin-right: 8px;
    }
    .pet-comments {
        list-style: none;
    }
    .pet-comments li {
        border-bottom: 1px solid #c8c8c8;
        margin-bottom: 8px;
    }
    .pet-comment {
        padding: 8px 0;
    }
</style>
<template>
    <div class="index">
        <Row type="flex" justify="center" align="middle" class="pet-mb-32">
            <Col span="12" style="text-align: center">
                <div style="text-align: center" v-show="showNotfound">
                    <h1><img :src="require('../chameleon.png')" alt=""></h1>
                    <h2 class="pet-mb-32">这里已经好像没有你要找的东西~</h2>
                    <router-link to="/">
                        <Button type="primary" size="large">返回首页</Button>
                    </router-link>
                    <router-link to="/account">
                        <Button type="ghost" size="large">个人中心</Button>
                    </router-link>
                </div>
            </Col>
        </Row>
        <Row type="flex" justify="center" align="middle" v-if="!showNotfound">
            <Col span="12" style="text-align: center">
                <Card class="pet-mb-32">
                    <Row type="flex" justify="center" align="top" class="pet-pt-16 pet-pb-16">
                        <Col span="8">
                            <img class="pet-avatar" :src="avatar" alt="">
                        </Col>
                        <Col span="16">
                            <div>
                            <Row type="flex" justify="center" align="top">
                                <Col span="8">
                                <p class="text-right"><Icon type="at"></Icon> ID</p>
                                </Col>
                                <Col span="16">
                                <p class="text-left">{{ id }}</p>
                                </Col>
                                <Col span="8">
                                <p class="text-right"><Icon type="social-octocat"></Icon>名称</p>
                                </Col>
                                <Col span="16">
                                <p class="text-left">{{ name }}</p>
                                </Col>
                                <Col span="8">
                                <p class="text-right"><Icon type="ios-paw"></Icon>生日</p>
                                </Col>
                                <Col span="16">
                                <p class="text-left">{{ fmtBirthday }}</p>
                                </Col>
                                <Col span="8">
                                <p class="text-right"><Icon type="heart"></Icon>主人寄语</p>
                                </Col>
                                <Col span="16">
                                <p class="text-left">{{ remark }}</p>
                                </Col>
                            </Row>
                        </div>
                        </Col>
                        <Col span="24">
                        <Button type="error" shape="circle"
                                icon="heart" size="large"
                                @click="handleLikeClick">赞赏</Button>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Row type="flex" justify="center" align="middle" v-if="!showNotfound">
            <Col span="12">
                <div>
                    <Input v-model="comment" type="textarea" :rows="4" placeholder="萌宠真可爱，夸夸 ta 吧..."></Input>
                    <Button class="pet-mt-8" type="primary" size="large" @click="handleCommentPost">发表评论</Button>
                </div>
                <div>
                    <Card class="pet-mb-32 pet-mt-8" v-if="comments.length > 0">
                        <p slot="title">
                            <Icon type="chatbubbles"></Icon>
                            全部评论
                        </p>
                        <ul class="pet-comments">
                            <li v-for="(comment, idx) in comments" :key="idx">
                                <p>来自：{{ comment.from }} - 发布时间：{{ comment.sentTime | dateFmt }}</p>
                                <p class="pet-comment">{{ comment.content }}</p>
                            </li>
                        </ul>
                    </Card>
                </div>
            </Col>
        </Row>
        <Spin size="large" fix v-if="loading"></Spin>
    </div>
</template>
<script>
    import util from '../libs/util';
    import NebPay from '../libs/nebpay';
    import {Account} from 'nebulas';

    var nebPay = new NebPay();

    export default {
        data() {
            return {
                account: null,
                id: '',
                avatar: '',
                name: '',
                birthday: '',
                remark: '',
                comment: '',
                comments: [],
                petCardId: '',
                loading: true,
                showNotfound: false,
                interval: null,
                exCount: 0,
                rewardValue: ''
            }
        },
        computed: {
            fmtBirthday() {
                if (this.birthday) {
                    return util.dateFmt(this.birthday);
                }
                return '未知';
            }
        },
        filters: {
            dateFmt: function (dateString) {
                if (dateString) {
                    let date = typeof dateString !== 'object' ? new Date(dateString * 1000) : dateString;
                    const tmpDate = {
                        year: date.getFullYear(),
                        month: (date.getMonth() < 9) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1),
                        day: (date.getDate() < 10) ? '0' + date.getDate() : date.getDate(),
                        hour: (date.getHours() < 10) ? '0' + date.getHours() : date.getHours(),
                        min: (date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes(),
                        sec: (date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds()
                    };
                    return `${tmpDate.year}年${tmpDate.month}月${tmpDate.day}日`;
                } else {
                    return '未知';
                }
            }
        },
        watch: {
            '$route': 'getPetCardById'
        },
        created() {
            this.interval = setInterval(() => {
                if (this.exCount > 5) {
                    clearInterval(this.interval);
                    this.showError();
                }
                this.exCount++;
                this.initAccount();
            }, 1000);
        },
        methods: {
            initAccount() {
                const address = localStorage.getItem('nasAddress');
                if (address) {
                    clearInterval(this.interval);
                    this.account = Account.fromAddress(address);
                    this.getPetCardById();
                    this.getComments();
                }
            },
            showError() {
                this.$Modal.warning({
                    title: '请先安装浏览器钱包插件',
                    content: `<p>检测到你还没安装浏览器钱包插件，请先<a href="https://github.com/ChengOrangeJu/WebExtensionWallet" target="_blank">安装 NAS 钱包插件</a></p><br>
                              <p>如果你还没有创建 NAS 钱包，可以参考官方教程进行创建「<a href="https://blog.nebulas.io/2018/04/12/creating-a-nas-wallet/" target="_blank">星云Web钱包教程1：创建NAS钱包</a>」</p><br>
                              <p>确认导入钱包并解锁后，请刷新页面重新进行操作 :)</p>`
                });
            },
            getPetCardById() {
                if (!this.account) {
                    this.showError();
                    return;
                }
                if ('id' in this.$route.params) {
                    this.petCardId = this.$route.params.id;
                    let to = util.getContractAddress(),
                        args = util.toSting([this.petCardId]);
                    nebPay.simulateCall(to, '0', 'getPetCardById', args, {
                        listener: this.setPetCardDetail
                    });
                }
            },
            getComments() {
                let to = util.getContractAddress(),
                    args = util.toSting([this.petCardId]);
                nebPay.simulateCall(to, '0', 'getComments', args, {
                    listener: (data) => {
                        const res = util.parse(data.result);
                        if (res && !!res.length) {
                            this.comments = res;
                        }
                    }
                });
            },
            setPetCardDetail(data) {
                if (data.result !== "null" && !data.execute_err) {
                    const res = util.parse(data.result);
                    this.id = res.id;
                    this.avatar = res.photo;
                    this.name = res.name;
                    this.birthday = res.birthday;
                    this.remark = res.remark;
                } else {
                    this.showNotfound = true;
                }
                this.loading = false;
            },
            handleCommentPost() {
                this.loading = true;
                let content = this.comment;
                let to = util.getContractAddress(),
                    args = util.toSting([this.petCardId, content]);
                nebPay.call(to, '0', 'createComment', args, {
                    listener: (data) => {
                        if (typeof data !== 'string') {
                            this.$Modal.success({
                                title: '评论成功',
                                content: '你的评论已经发送出去啦~'
                            });
                            this.comments.unshift({
                                from: this.account.getAddressString(),
                                content: content,
                                sentTime: new Date()
                            });
                        } else {
                            this.$Modal.error({
                                title: '评论失败',
                                content: '交易被取消，评论失败 :('
                            });
                        }
                        this.loading = false;
                    }
                });
            },
            handleLikeCallback(data) {
                if (typeof data !== 'string') {
                    this.$Modal.success({
                        title: '赞赏成功',
                        content: '感谢您的赞赏 :)'
                    });
                } else {
                    this.$Modal.error({
                        title: '交易取消',
                        content: '赞赏失败 :('
                    });
                }
                this.loading = false;
            },
            handleLikeClick() {
                this.$Modal.confirm({
                    render: (h) => {
                        return h('div', [
                            h('p', '* 赞赏单位为 NAS（1 NAS = 1EWei = 10^18 Wei）'),
                            h('Input', {
                                props: {
                                    value: this.rewardValue,
                                    autofocus: true,
                                    placeholder: '请输入赞赏数额...'
                                },
                                on: {
                                    input: (val) => {
                                        this.rewardValue = val;
                                    }
                                }
                            })
                        ]);
                    },
                    onOk: () => {
                        this.loading = true;
                        var args = util.toSting([this.id]);
                        nebPay.call(util.getContractAddress(), this.rewardValue, 'giveItReward', args, {
                            listener: this.handleLikeCallback
                        })
                    }
                });
            },
        }
    };
</script>