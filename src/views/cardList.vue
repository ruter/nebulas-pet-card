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
</style>
<template>
    <div class="index pet-mb-160">
        <Row type="flex" justify="center" align="middle" v-if="found">
            <Col span="4" style="text-align: center">
                <Card class="pet-mb-32">
                <Row type="flex" justify="center" align="middle" class="pet-pt-16 pet-pb-16">
                    <Col span="24">
                    <img class="pet-avatar" :src="avatar" alt="">
                    </Col>
                    <Col span="24">
                    <Button type="error" shape="circle"
                            icon="heart" size="large"
                            @click="handleLikeClick">赞赏</Button>
                    <router-link :to="'/detail/' + id">
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
                        </Row>
                    </div>
                    </Col>
                </Row>
            </Card>
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
                page: 0,
                limit: 12,
                size: null,
                petCards: [],
                loading: true,
                interval: null,
                exCount: 0,
                rewardValue: ''
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
        methods: {
            initAccount() {
                const address = localStorage.getItem('nasAddress');
                if (address) {
                    clearInterval(this.interval);
                    this.account = Account.fromAddress(address);
                    this.getPetCards();
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
            getPetCards() {
                if (!this.account) {
                    this.showError();
                    return;
                }
                this.page++;
                let to = util.getContractAddress(),
                    args = util.toSting([this.page, this.limit]);
                nebPay.simulateCall(to, '0', 'getPetCards', args, {
                    listener: this.setPetCardDetail
                });
            },
            setPetCardDetail(data) {
                if (data.result !== "null") {
                    const res = util.parse(data.result);
                    this.id = res.id;
                    this.avatar = res.photo;
                    this.name = res.name;
                    this.birthday = res.birthday;
                    this.remark = res.remark;
                }
                this.loading = false;
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