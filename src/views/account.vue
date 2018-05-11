<style scoped>
    .index {
        width: 100%;
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
    .pet-mr-8 {
        margin-right: 8px;
    }
    .pet-mr-32 {
        margin-right: 32px;
    }
    .pet-pb-16 {
        padding-bottom: 16px;
    }
    .pet-pt-16 {
        padding-top: 16px;
    }
    .pet-mt-16 {
        margin-top: 16px;
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
</style>
<template>
    <div class="index pet-mb-160">
        <Tabs>
            <TabPane label="我的宠物卡" icon="social-octocat">
                <Row type="flex" align="middle">
                    <Col span="4" style="text-align: center" v-for="card in petCards" :key="card.id">
                    <Card class="pet-mb-32 pet-mr-8">
                        <Row type="flex" justify="center" align="middle" class="pet-pt-16 pet-pb-16">
                            <Col span="24">
                            <img class="pet-avatar" :src="card.photo" alt="">
                            </Col>
                            <Col span="24">
                            <Button type="error" shape="circle"
                                    icon="heart" size="large"
                                    @click="handleLikeClick(card.id)">赞赏</Button>
                            <router-link :to="'/detail/' + card.id">
                                <Button type="ghost" shape="circle"
                                        icon="chatbubble-working" size="large">评论</Button>
                            </router-link>
                            </Col>
                        </Row>
                        <Row type="flex" justify="center" align="top" class="pet-pt-16 pet-pb-16">
                            <Col span="24">
                            <div>
                                <Row type="flex" justify="center" align="top">
                                    <Col span="8">
                                    <p class="text-right"><Icon type="at"></Icon> ID</p>
                                    </Col>
                                    <Col span="16">
                                    <p class="text-left">{{ card.id }}</p>
                                    </Col>
                                    <Col span="8">
                                    <p class="text-right"><Icon type="social-octocat"></Icon>名称</p>
                                    </Col>
                                    <Col span="16">
                                    <p class="text-left">{{ card.name }}</p>
                                    </Col>
                                    <Col span="8">
                                    <p class="text-right"><Icon type="ios-paw"></Icon>生日</p>
                                    </Col>
                                    <Col span="16">
                                    <p class="text-left">{{ card.birthday | dateFmt }}</p>
                                    </Col>
                                </Row>
                            </div>
                            </Col>
                        </Row>
                    </Card>
                    </Col>
                </Row>
                <Row type="flex" justify="center" align="middle" v-if="noData">
                    <Col span="12">
                    <div style="text-align: center">
                        <h1><img :src="require('../chameleon.png')" alt=""></h1>
                        <h2 class="pet-mb-32">
                            你还没有任何宠物卡哦~
                            <p>
                                为你的爱宠创建一张专属「身份证」吧！
                                <router-link to="/create">
                                    <Button type="primary" size="large" icon="social-octocat">
                                        <span>创建宠物卡</span>
                                    </Button>
                                </router-link>
                            </p>
                        </h2>
                    </div>
                    </Col>
                </Row>
            </TabPane>
            <TabPane label="转移代币" icon="social-usd">
                <Row type="flex" justify="center" align="middle">
                    <Col span="16" style="text-align: center">
                        <h2>
                            <span class="pet-mr-32">
                                <Icon type="ios-infinite"></Icon>NAS 余额: {{ userReward }} Wei（{{ userReward | nasFromBasic }} NAS）
                            </span>
                            <span><Icon type="cash"></Icon>钱包地址：{{ address }}</span>
                        </h2>
                        <hr>
                    </Col>
                </Row>
                <p class="pet-mb-32" style="text-align: center;">
                    * 转出代币的数值应大于 {{ transferLimit }} Wei（{{ transferLimit | nasFromBasic }} NAS），转出将扣除转出数额的 {{ transferFee }}% 作为手续费
                </p>
                <Row type="flex" justify="center" align="middle">
                    <Col span="8" style="text-align: center">
                        <Input v-model="transferAmount" size="large" placeholder="请输入要转出的代币数量...">
                            <span slot="prepend"><Icon type="ios-nutrition"></Icon></span>
                            <span slot="append">NAS</span>
                        </Input>
                        <p v-show="transferAmount > 0">
                            {{ transferAmount }} Wei ≈ {{ transferAmount | nasFromBasic }} NAS
                        </p>
                        <Button class="pet-mt-16" type="primary" size="large" @click="handleTransferClick">转出</Button>
                    </Col>
                </Row>
            </TabPane>
        </Tabs>
        <Spin size="large" fix v-if="loading"></Spin>
    </div>
</template>
<script>
    import util from '../libs/util';
    import NebPay from '../libs/nebpay';
    import {Account, Unit} from 'nebulas';

    var nebPay = new NebPay();

    export default {
        data() {
            return {
                address: '',
                account: null,
                petCards: [],
                loading: true,
                interval: null,
                noData: false,
                exCount: 0,
                rewardValue: '',
                userReward: '',
                transferLimit: '',
                transferFee: '',
                transferAmount: ''
            }
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
        filters: {
            dateFmt: function (dateString) {
                if (dateString) {
                    let date = typeof dateString !== 'object' ? new Date(dateString) : dateString;
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
            },
            nasFromBasic: function (value) {
                if (value) {
                    return Unit.fromBasic(value);
                }
                return 0;
            }
        },
        methods: {
            initAccount() {
                const address = localStorage.getItem('nasAddress');
                if (address) {
                    this.address = address;
                    clearInterval(this.interval);
                    this.account = Account.fromAddress(address);
                    this.getPetCardsByOwner();
                    this.getUserReward();
                    this.getTransferLimit();
                    this.getTransferFee();
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
            getPetCardsByIds(ids) {
                let to = util.getContractAddress(),
                    args = util.toSting([ids]);
                nebPay.simulateCall(to, '0', 'getPetCardsByIds', args, {
                    listener: (data) => {
                        this.petCards = util.parse(data.result);
                        this.loading = false;
                    }
                });
            },
            getPetCardsByOwner() {
                if (!this.account) {
                    this.showError();
                    return;
                }
                let to = util.getContractAddress(),
                    args = util.toSting([this.address]);
                nebPay.simulateCall(to, '0', 'getPetCardsByOwner', args, {
                    listener: (data) => {
                        const res = util.parse(data.result);
                        if (res && !!res.length) {
                            this.getPetCardsByIds(res);
                        } else {
                            this.noData = true;
                            this.loading = false;
                        }
                    }
                });
            },
            getTransferLimit() {
                let to = util.getContractAddress();
                nebPay.simulateCall(to, '0', 'getTransferLimit', "[]", {
                    listener: (data) => {
                        this.transferLimit = util.parse(data.result);
                    }
                });
            },
            getTransferFee() {
                let to = util.getContractAddress();
                nebPay.simulateCall(to, '0', 'getTransferFee', "[]", {
                    listener: (data) => {
                        let fee = util.parse(data.result);
                        this.transferFee = (fee * 100).toFixed(0);
                    }
                });
            },
            getUserReward() {
                let to = util.getContractAddress();
                nebPay.simulateCall(to, '0', 'getUserReward', "[]", {
                    listener: (data) => {
                        let reward = util.parse(data.result);
                        if (reward) {
                            this.userReward = reward.balance;
                        } else {
                            this.userReward = 0;
                        }
                    }
                });
            },
            handleTransferClick() {
                let to = util.getContractAddress(),
                    value = this.transferAmount,
                    limit = this.transferLimit,
                    userReward = this.userReward,
                    args = util.toSting([value]);
                if (!(value && Unit.toBasic(value).gt(limit))) {
                    this.$Modal.warning({
                        title: '数额错误',
                        content: `转出数额必须大于 ${limit} Wei（${Unit.fromBasic(limit)} NAS）`
                    });
                    return;
                }
                if (Unit.toBasic(value).gt(userReward)) {
                    this.$Modal.error({
                        title: '数额错误',
                        content: `转出数额不能大于余额 ${userReward} Wei（${Unit.fromBasic(userReward)} NAS）`
                    });
                    return;
                }
                nebPay.simulateCall(to, "0", 'transfer', args, {
                    listener: (data) => {
                        console.log(data)
                        let reward = util.parse(data.result);
                        this.userReward = reward.balance;
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
            handleLikeClick(id) {
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
                        var args = util.toSting([id]);
                        nebPay.call(util.getContractAddress(), this.rewardValue, 'giveItReward', args, {
                            listener: this.handleLikeCallback
                        })
                    }
                });
            }
        }
    };
</script>