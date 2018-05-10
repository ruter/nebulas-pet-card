<style scoped>
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
    }
    .layout-logo{
        width: 100px;
        height: 32px;
        /*background: #5b6270;*/
        border-radius: 3px;
        float: left;
        position: relative;
        top: 15px;
        left: 20px;
    }
    .layout-logo img {
        width: 100px;
        height: 32px;
    }
    .layout-nav{
        width: 400px;
        margin: 0 auto;
        margin-right: 20px;
    }
    .layout-footer-center{
        text-align: center;
    }
</style>
<template>
    <div class="layout">
        <Layout>
            <Header>
                <Menu mode="horizontal" theme="dark" active-name="home">
                    <div class="layout-logo"><img :src="require('./logo.png')" alt=""></div>
                    <div class="layout-nav">
                        <router-link to="/">
                            <MenuItem name="home">
                                <Icon type="ios-home"></Icon>
                                首页
                            </MenuItem>
                        </router-link>
                        <router-link to="/petcard">
                            <MenuItem name="petcard">
                                <Icon type="social-octocat"></Icon>
                                探索宠物卡
                            </MenuItem>
                        </router-link>
                        <router-link to="/account">
                            <MenuItem name="account">
                                <Icon type="person"></Icon>
                                个人中心
                            </MenuItem>
                        </router-link>
                    </div>
                </Menu>
            </Header>
            <Content :style="{padding: '0 50px'}">
                <Breadcrumb :style="{margin: '20px 0'}">
                    <BreadcrumbItem>宠物卡</BreadcrumbItem>
                    <BreadcrumbItem v-for="breadcrumb in $route.meta.breadcrumbs"
                                    :key="breadcrumb">{{ breadcrumb }}</BreadcrumbItem>
                </Breadcrumb>
                <Card>
                    <div style="min-height: 200px;">
                        <router-view></router-view>
                    </div>
                </Card>
            </Content>
            <Footer class="layout-footer-center">2018 &copy; PetCard</Footer>
        </Layout>
    </div>
</template>
<script>
    export default {
        data() {
            return {

            };
        },
        mounted() {

        },
        beforeDestroy() {

        },
        methods: {

        }
    };
</script>