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
        width: 100%;
        padding: 8px;
    }
    .pet-pb-16 {
        padding-bottom: 16px;
    }
    .pet-pt-16 {
        padding-top: 16px;
    }
</style>
<template>
    <div class="index">
        <Row type="flex" justify="center" align="middle" class="pet-mb-32">
            <Col span="12">
                <Steps :current="currentStep">
                    <Step title="填写" content="填写爱宠的相关信息"></Step>
                    <Step title="确认" content="确认爱宠信息无误"></Step>
                    <Step title="完成" content="宠物卡创建完成"></Step>
                </Steps>
            </Col>
        </Row>
        <Row type="flex" justify="center" align="middle" class="pet-mb-160">
            <Col span="12" v-if="currentStep === 0">
                <Form ref="petCardForm" :model="petCardForm" :rules="ruleValidate" :label-width="80">
                    <FormItem label="爱宠名称" prop="name">
                        <Input v-model="petCardForm.name" placeholder="告诉我 ta 的名字吧"></Input>
                    </FormItem>
                    <FormItem label="出生日期" prop="date">
                        <DatePicker type="date" placeholder="选择爱宠的出生日期" v-model="petCardForm.date"></DatePicker>
                    </FormItem>
                    <FormItem label="主人寄语" prop="desc">
                        <Input v-model="petCardForm.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="你们之间一定有不少趣事..."></Input>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" @click="handleNextClick('petCardForm')">下一步</Button>
                    </FormItem>
                </Form>
            </Col>
            <Col span="8" v-if="currentStep === 1">
                <Card class="pet-mb-32">
                    <Row type="flex" justify="center" align="top" class="pet-pt-16 pet-pb-16">
                        <Col span="8">
                            <img class="pet-avatar" src="data:image/png;base64,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" alt="Pepe">
                        </Col>
                        <Col span="16">
                            <div style="margin-top: 32px">
                                <p>爱宠名称：{{ petCardForm.name }}</p>
                                <p>出生日期：{{ petCardForm.date }}</p>
                                <p style="display: inline-block">主人寄语：</p>
                                <p style="display: inline-block">{{ petCardForm.desc }}</p>
                            </div>
                        </Col>
                    </Row>
                </Card>
                <Button type="ghost" @click="currentStep--">上一步</Button>
                <Button type="primary" @click="handleConfirmClick">确定</Button>
            </Col>
            <Col span="12" v-if="currentStep === 2">
                <div style="text-align: center">
                    <h1><img :src="require('../chameleon.png')" alt=""></h1>
                    <h2 class="pet-mb-32">「{{ petCardForm.name }}」的宠物卡已经创建，你可以在「个人中心」-「宠物卡」中查看</h2>
                    <router-link to="/">
                        <Button type="primary" size="large">返回首页</Button>
                    </router-link>
                    <router-link to="/account">
                        <Button type="ghost" size="large">个人中心</Button>
                    </router-link>
                </div>
            </Col>
        </Row>
    </div>
</template>
<script>
    import util from '../libs/util';
    import NebPay from '../libs/nebpay';
    import {Neb, HttpRequest, Account} from 'nebulas';

    var neb = new Neb();
    var nebPay = new NebPay();
    neb.setRequest(new HttpRequest("https://testnet.nebulas.io"));

    export default {
        data() {
            return {
                account: null,
                currentStep: 0,
                serialNumber: '',
                petCardForm: {
                    name: '',
                    date: '',
                    desc: '',
                    avatar: ''
                },
                ruleValidate: {
                    name: [
                        { required: true, message: '爱宠怎么可以没有一个好听的名字呢', trigger: 'blur' }
                    ],
                    date: [
                        { required: true, type: 'date', message: '不记得 ta 的生日了？想想看 ta 是什么时候成为你的家庭成员的', trigger: 'change' }
                    ],
                    desc: [
                        { required: true, message: '有什么想对 ta 说的吗', trigger: 'blur' }
                    ]
                }
            }
        },
        created() {
            this.getAccount();
        },
        methods: {
            initAccount(data) {
                const address = util.parse(data.result);
                this.account = Account.fromAddress(address);
            },
            getAccount() {
                let self = this;
                nebPay.simulateCall(util.getContractAddress(), "0", "getUserAddress", "", {
                    listener: self.initAccount
                });
            },
            handleNextClick(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.currentStep++;
                    } else {
                        this.$Message.error('请将信息填写完整');
                    }
                })
            },
            handleConfirmClick() {
                let info = {
                    name: this.petCardForm.name,
                    birthday: +this.petCardForm.birthday,
                    photo: this.petCardForm.avatar,
                    remark: this.petCardForm.desc
                };
                this.handleCreate(info);
            },
            handleCreate(info) {
                let to = util.getContractAddress(),
                    args = util.toSting([info]);
                this.serialNumber = nebPay.call(to, '0', 'createPetCard', args, {
                    listener: (data) => {
                        this.currentStep++;
                        this.$Message.success('Success!');
                    }
                });
            }
        }
    };
</script>