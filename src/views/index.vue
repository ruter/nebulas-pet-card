<style scoped>
    .index {
        width: 100%;
        text-align: center;
    }

    .index h1 {
        height: 150px;
    }

    .index h1 img {
        height: 100%;
    }

    .index h2 {
        color: #666;
    }

    .index h2 p {
        margin: 0 0 50px;
    }

    .index .ivu-row-flex {
        height: 100%;
    }

    .pet-card-search {
        margin-bottom: 32px;
    }
    .pet-card-help {
        margin-bottom: 200px;
    }
</style>
<template>
    <div class="index">
        <Row type="flex" justify="center" align="middle">
            <Col span="24">
                <h1>
                    <img src="https://raw.githubusercontent.com/iview/iview/master/assets/logo.png">
                </h1>
                <h2>
                    <p>
                        为你的爱宠创建专属「身份证」
                        <router-link to="/create">
                            <Button type="primary" size="large" icon="social-octocat">
                                <span>创建宠物卡</span>
                            </Button>
                        </router-link>
                    </p>
                </h2>
            </Col>
            <Col span="12">
                <Input v-model="petCardId" placeholder="输入宠物卡 ID 查找宠物身份信息..." class="pet-card-search">
                    <Button slot="append" icon="ios-search" @click="handleSearchClick"></Button>
                </Input>
            </Col>
            <Col span="24" class="pet-card-help">
                <p>「宠物卡」是基于星云3.0公链的宠物身份存证系统，所有的宠物信息都会被存储于星云链上，数据全部真实有效且无法篡改和撤销。</p>
                <p>除了可以使用宠物卡为你的爱宠创建独一无二的专属「身份证」外，还可以对其他宠物进行「留言」以及「赞赏」，这些数据同样会被记录在星云链中。</p>
                <p>你创建的宠物卡被赞赏后所得到的 NAS 全都可以提取到你的个人钱包（需扣除一定的提取费用，这个比例很小，只有1%）</p>
            </Col>
        </Row>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                petCardId: null
            }
        },

        methods: {
            handleSearchClick() {
                let id = this.petCardId;
                this.$router.push(`/search/${id}`);
            }
        }
    };
</script>