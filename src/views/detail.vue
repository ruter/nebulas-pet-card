<template>
    <div class="index">
        <Row type="flex" justify="center" align="middle">
            <Col span="24">

            </Col>
        </Row>
        <Spin size="large" fix v-if="loading"></Spin>
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
                loading: true,
            }
        },
        methods: {
            initAccount() {
                const address = localStorage.getItem('nasAddress');
                this.account = Account.fromAddress(address);
            },
        },
        created() {
            this.initAccount();
        }
    };
</script>