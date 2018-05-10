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
    .pet-img-upload {
        width: 64px;
        height:64px;
        line-height: 64px;
        background: #fff;
        border: 1px dashed #dddee1;
        border-radius: 4px;
        text-align: center;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .pet-upload-image img {
        width: 64px;
        height: 64px;
    }
    .pet-upload-image-cover{
        width: 64px;
        height: 64px;
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
        text-align: center;
    }
    .pet-upload-image:hover .pet-upload-image-cover{
        display: block;
    }
    .pet-upload-image-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
        vertical-align: middle;
        transform: translateY(50%);
        -moz-transform: translateY(50%);
        -webkit-transform: translateY(50%);
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
                    <FormItem label="萌宠照片" prop="avatar">
                        <div v-if="petCardForm.avatar" class="pet-upload-image">
                            <img :src="petCardForm.avatar">
                            <div class="pet-upload-image-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove"></Icon>
                            </div>
                            <input type="hidden" v-model="petCardForm.avatar">
                        </div>
                        <div v-else>
                            <input id="petAvatar" type="file" accept="image/*" style="display: none;" @change="handleImgUpload"/>
                            <label for="petAvatar">
                                <div class="pet-img-upload">
                                    <Icon type="camera" size="20"></Icon>
                                </div>
                            </label>
                        </div>
                    </FormItem>
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
                <Modal title="萌宠照片" v-model="viewImage">
                    <img :src="petCardForm.avatar" v-if="viewImage" style="width: 100%">
                </Modal>
            </Col>
            <Col span="8" v-if="currentStep === 1">
                <Card class="pet-mb-32">
                    <Row type="flex" justify="center" align="top" class="pet-pt-16 pet-pb-16">
                        <Col span="8">
                            <img class="pet-avatar" :src="petCardForm.avatar" alt="Pepe">
                        </Col>
                        <Col span="16">
                            <div style="margin-top: 32px">
                                <p>爱宠名称：{{ petCardForm.name }}</p>
                                <p>出生日期：{{ fmtBirthday }}</p>
                                <p>主人寄语：</p>
                                <p>{{ petCardForm.desc }}</p>
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
                    <p class="pet-mb-32">* 数据写入需要一定时间，如果不能马上看到新创建的宠物卡，可以稍候再刷新查看</p>
                    <router-link to="/">
                        <Button type="primary" size="large">返回首页</Button>
                    </router-link>
                    <router-link to="/account">
                        <Button type="ghost" size="large">个人中心</Button>
                    </router-link>
                </div>
            </Col>
            <Spin size="large" fix v-if="loading"></Spin>
        </Row>
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
                    ],
                    avatar: [
                        { required: true, message: ' ', trigger: 'change' }
                    ]
                },
                loading: false,
                viewImage: false,
                imageURL: ''
            }
        },
        computed: {
            fmtBirthday() {
                return util.dateFmt(this.petCardForm.date);
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
            handleView() {
                this.viewImage = true;
            },
            handleRemove() {
                this.imageURL = '';
                this.petCardForm.avatar = '';
            },
            handleImgUpload(e) {
                let img = e.target.files[0];
                let reader = new FileReader();

                reader.readAsDataURL(img);
                reader.onload = (arg) => {
                    this.petCardForm.avatar = arg.target.result;
                };

                let formData = new FormData();
                formData.append('smfile',img);
                formData.append('ssl', true);

                util.uploadImg(formData).then(res => {
                    this.imageURL = res.data.data.url;
                }).catch(err => {
                    console.error(err);
                })
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
                if (this.account) {
                    this.loading = true;
                    let info = {
                        name: this.petCardForm.name,
                        birthday: +this.petCardForm.birthday,
                        photo: this.imageURL,
                        remark: this.petCardForm.desc
                    };
                    this.handleCreate(info);
                } else {
                    this.$Modal.warning({
                        title: '请先安装浏览器钱包插件',
                        content: `<p>检测到你还没安装浏览器钱包插件，请先<a href="https://github.com/ChengOrangeJu/WebExtensionWallet" target="_blank">安装 NAS 钱包插件</a></p><br>
                                  <p>如果你还没有创建 NAS 钱包，可以参考官方教程进行创建「<a href="https://blog.nebulas.io/2018/04/12/creating-a-nas-wallet/" target="_blank">星云Web钱包教程1：创建NAS钱包</a>」</p><br>
                                  <p>确认导入钱包并解锁后，请刷新页面重新进行操作 :)</p>`
                    });
                }
            },
            handleCreate(info) {
                let to = util.getContractAddress(),
                    args = util.toSting([info]);
                this.serialNumber = nebPay.call(to, '0', 'createPetCard', args, {
                    listener: (data) => {
                        if (typeof data === 'object') {
                            this.currentStep++;
                        } else {
                            this.$Modal.error({
                                title: '创建失败',
                                content: '交易被取消，宠物卡创建失败'
                            });
                        }
                        this.loading = false;
                    }
                });
            }
        }
    };
</script>