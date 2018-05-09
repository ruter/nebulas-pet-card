<template>
    <div class="index">
        <Row type="flex" justify="center" align="middle">
            <Col span="24">
            <h2>
                <p>Welcome to your iView app!</p>
                <Button type="ghost" @click="getAccount">Get Account</Button>
            </h2>
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
            }
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
            }
        },
        created() {

        }
    };
</script>