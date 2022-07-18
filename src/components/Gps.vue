<template>
  <div>
    <div class="container">
      <div class="content">
        <div class="control">
          <div class="ask" v-for="(value, key) in buttons" :key="key">
            <div class="button" v-on:click="submit(value)">{{ key }}</div>
            <div class="result">{{ result[value] }}</div>
          </div>
        </div>
        <div class="config-c">
          <div class="config" v-for="(value, key) in configs" :key="key">
            <div class="button">{{ value.lab }}</div>
            <input
              v-bind:value="value.value"
              @input="value.value = $event.target.value"
            />
            <div class="button" v-on:click="submit(parseInt(key))">读取</div>
            <div class="button" v-on:click="submit(parseInt(key) + 1)">
              配置
            </div>
          </div>
          <div class="config">
            <div>协议号</div>
            <input v-model="protocol" style="width: 30px" />
            <div>数据</div>
            <input v-model="command_hex" style="width: 45%" />
            <div class="button" @click="submitcomd">发送</div>
          </div>
        </div>
      </div>
    </div>
    <div class="data">
      <p class="" v-for="(value, key) in rcvdata" :key="key">{{ value }}</p>
    </div>
    <div>
      <p v-for="(value, key) in services" :key="key">
        {{ value }} {{ key }} [0x{{ key.toString(16) }}]
      </p>
    </div>
  </div>
</template>

<script>
import GPS from "gps";
export default {
  name: "gps",
  data() {
    return {
      count: 0,
      rcvdata: [],
      result: { 11: "111111" },
      server1: "",
      port1: 0,
      server2: "",
      port2: 0,
      ipmod: 0,
      netmod: 0,
      protocol: "",
      command_hex: "",
      token: "xx09988",
      msgs: { pid: "122334" },
      buttons: {
        查询pid: 0,
        查询ip: 25,
        查询ccid: 27,
        查询imei: 28,
        查询csq: 23,
        保存配置: 21,
        重新启动: 32,
      },
      configs: {
        1: { lab: "工作模式", value: "0" },
        3: { lab: "网络模式", value: "0" },
        5: { lab: "ip模式", value: "0" },
        7: { lab: "调试模式", value: "0" },
        9: { lab: "电话", value: "0" },
        13: { lab: "系统密码", value: "0" },
        15: { lab: "登陆凭证", value: "0" },
        17: { lab: "gps状态", value: "0" },
      },
      services: [
        "SERVICE_HEART",
        " APP_INFO",
        " SERVICE_R_WKMODE",
        " SERVICE_W_WKMODE",
        " SERVICE_R_NETMOD",
        " SERVICE_W_NETMOD",
        " SERVICE_R_IPMOD",
        " SERVICE_W_IPMOD",
        " SERVICE_R_DBGMOD",
        " SERVICE_W_DBGMOD",
        " SERVICE_R_TEL",
        " SERVICE_W_TEL",
        " SERVICE_R_UART",
        " SERVICE_W_UART",
        " SERVICE_R_SYSPWD",
        " SERVICE_W_SYSPWD",
        " SERVICE_R_TOKEN",
        " SERVICE_W_TOKEN",
        " SERVICE_R_GPRS_STATE",
        " SERVICE_W_GPRS_STATE",
        " SERVICE_R_SERVER_IP",
        " SERVICE_W_SERVER_IP",
        " SERVICE_R_NTRIP_IP",
        " SERVICE_W_NTRIP_IP",
        " SERVICE_R_GNSS_NTRIP_MOUNT",
        " SERVICE_W_GNSS_NTRIP_MOUNT",
        " SERVICE_R_GNSS_NTRIP_ACCONT",
        " SERVICE_W_GNSS_NTRIP_ACCONT",
        " SERVICE_R_GNSS_NTRIP_PASSWD",
        " SERVICE_W_GNSS_NTRIP_PASSWD",
        " SERVICE_R_HBTIME",
        " SERVICE_W_HBTIME",
        // ,SERVICE_R_APN
        // ,SERVICE_W_APN
        // ,SERVICE_R_IDLTIME
        // ,SERVICE_W_IDLTIME
        "SERVICE_SAVE_CONFIG",
        "SERVICE_GPRS",
        "SERVICE_GPRS_CACHE",
        "SERVICE_GNSS_NTRIP",
        "SERVICE_ID",
        "SERVICE_DCDAID",
        "SERVICE_CSQ",
        "SERVICE_GSTCDE",
        "SERVICE_IP",
        "SERVICE_REG",
        "SERVICE_ICCID",
        "SERVICE_IMEI",
        "SERVICE_RESTART",
        "SERVICE_FILE",
        "SERVICE_FILE_COMD",
        "SERVICE_GPIO",
        "SERVICE_ADC",
        ///
        "SERVICE_BT",
        "SERVICE_CDA",
        "SERVICE_SD",
        "SERVICE_OPERATE_RESPONSE",
        "SERVICE_SOCKET_SWITCH",
        "SERVICE_SOCKET_DISCONNECT",
        "SERVICE_CHECK_UPDATE",
        "SERVICE_UPDATE",
      ],
      websock: null,
      gps: new GPS(),
    };
  },
  created() {
    this.initWebSocket();
  },
  destroyed() {
    this.websock.close(); //离开路由之后断开websocket连接
  },
  methods: {
    submitcomd(arg) {
      let arr =
        this.command_hex == ""
          ? undefined
          : this.command_hex.split(",").map((v, i, a) => parseInt(v));
      let actions = { command: parseInt(this.protocol), data: arr };
      console.log("submitcomd", actions);
      this.websocketsend(JSON.stringify(actions));
    },
    submit(arg) {
      let d;
      if (this.configs[arg - 1]) {
        d = parseInt(this.configs[arg - 1].value);
      } else {
        d = undefined;
      }
      let actions = { command: arg, data: d != undefined ? [d] : undefined };
      console.log("submit" + arg + " " + actions.data);
      this.websocketsend(JSON.stringify(actions));
    },
    initWebSocket() {
      //初始化weosocket
      const wsuri = "ws://127.0.0.1:3100";
      this.websock = new WebSocket(wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;

      // Add an event listener on all protocols
      this.gps.on("data", (parsed) => {
        console.log(parsed);
      });
    },
    websocketonopen() {
      //连接建立之后执行send方法发送数据
      let actions = { test: "12345" };
      this.websocketsend(JSON.stringify(actions));
    },
    websocketonerror() {
      //连接建立失败重连
      this.initWebSocket();
    },
    websocketonmessage(e) {
      //数据接收
      // this.rcvdata+=e.data.toString('hex')
      try {
        const redata = JSON.parse(e.data);
        console.log(redata);
        if (redata.data.length == 0) return;
        // this.rcvdata.push(Buffer.from(redata.data));
        // gps数据
        if (redata.proto == 144) this.rcvdata.unshift(Buffer.from(redata.data));
        // console.log(Buffer.from(redata.data).toString());
        // 非gps数据
        else
          this.rcvdata.unshift(
            redata.data.map((d) => d.toString(16)).toString()
          );
        this.gpsData = redata;
        if (redata.proto == 144)
          this.gps.update(Buffer.from(redata.data).toString());
        this.gps.on("data", (parsed) => {
          console.log("gps parse:", parsed);
        });
      } catch (e) {}
    },
    websocketsend(Data) {
      //数据发送
      this.websock.send(Data);
    },
    websocketclose(e) {
      //关闭
      console.log("断开连接", e);
    },
  },
};
</script>

<style>
.container {
  display: flex;
}
.ask {
  display: flex;
  width: 200px;
  justify-content: space-around;
  margin: 2px;
}
.button {
  width: max-content;
  cursor: pointer;
  margin: 2px;
  margin-right: 10px;
  width: 100px;
}
.result {
  margin: 2px;
}
.config {
  display: flex;
  justify-content: flex-end;
  margin: 4px;
}
.content {
  display: flex;
  width: 100%;
  justify-content: space-around;
  flex-direction: row;
}
.input {
  width: 100%;
}
.item {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 5px;
}
.item-left {
  display: flex;
  justify-content: flex-end;
  width: 20%;
  margin-right: 5px;
}
.item-right {
  display: flex;
  justify-content: flex-start;
  width: 50%;
}
.item-right2 {
  display: flex;
  justify-content: flex-start;
  width: 30px;
}
.data {
  display: flex;
  width: 50%;
  height: 500px;
  font-size: 5px;
  flex-direction: column;
  overflow: hidden;
}
</style>