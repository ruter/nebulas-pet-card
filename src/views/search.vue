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
        <Row type="flex" justify="center" align="middle" class="pet-mb-32">
            <Col span="12" style="text-align: center">
                <h2 class="pet-mb-32" v-show="showNotfound">没有找到 ID 为「{{ $route.params.id }}」的宠物卡，换个 ID 再试试看吧 :)</h2>
                <Input v-model="petCardId" placeholder="输入宠物卡 ID 查找宠物身份信息..." class="pet-card-search">
                    <Button slot="append" icon="ios-search" @click.native="handleSearchClick"></Button>
                </Input>
            </Col>
        </Row>
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
                                    <!--<Col span="8">-->
                                        <!--<p class="text-right"><Icon type="heart"></Icon>主人寄语</p>-->
                                    <!--</Col>-->
                                    <!--<Col span="16">-->
                                        <!--<p class="text-left">{{ remark }}</p>-->
                                    <!--</Col>-->
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
                id: '',
                avatar: '',
                name: '',
                birthday: '',
                remark: '',
                petCardId: '',
                loading: true,
                found: false,
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
        watch: {
            '$route': 'getPetCard'
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
                    this.getPetCard();
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
            getPetCard() {
                if (!this.account) {
                    this.showError();
                    return;
                }
                if ('id' in this.$route.params) {
                    let to = util.getContractAddress(),
                        petCardId = this.$route.params.id,
                        args = util.toSting([petCardId]);
                    nebPay.simulateCall(to, '0', 'getPetCardById', args, {
                        listener: this.setPetCardDetail
                    });
                }
            },
            setPetCardDetail(data) {
                if (data.result !== "null" && !data.execute_err) {
                    const res = util.parse(data.result);
                    this.id = res.id;
                    this.avatar = res.photo;
                    this.name = res.name;
                    this.birthday = res.birthday;
                    this.remark = res.remark;
                    this.found = true;
                } else {
                    this.found = false;
                    this.showNotfound = true;
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
            handleSearchClick() {
                let id = this.petCardId;
                this.$router.push(`/search/${id}`);
                this.loading = true;
                this.showNotfound = false;
            }
        }
    };
</script>