<template>
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
          <input  v-bind:value="value.value"  @input="value.value =$event.target.value" />
          <div class="button" v-on:click="submit(parseInt(key))">读取</div>
          <div class="button" v-on:click="submit(parseInt(key) + 1)">配置</div>
        </div>
        <div class="config">
          <div>协议号</div><input v-model="protocol" style="width:30px">
          <div>数据</div><input v-model="command_hex" style="width: 45%;">
          <div class="button" @click="submitcomd">发送</div>
        </div>
        <div class="button" @click="submit">保存配置</div>
      </div>
    </div>
    <div class="data">
      <p class="" v-for="(value, key) in rcvdata" :key="key">{{ value }}</p>
    </div>
  </div>
</template>

<script>
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
      protocol:"",
      command_hex:"",
      token: "xx09988",
      msgs: { pid: "122334" },
      buttons: {
        查询pid: 0,
        查询ip: 25,
        查询ccid: 27,
        查询imei: 28,
        查询csq: 23,
        保存配置: 19,
      },
      configs: {
        1:{ lab: "工作模式",  value: "0" },
        3:{ lab: "网络模式",  value: "0" },
        5:{ lab: "ip模式",  value: "0" },
        7:{ lab: "调试模式",  value: "0" },
        9:{ lab: "电话",  value: "0" },
        13:{ lab: "系统密码",  value: "0" },
        15:{ lab: "登陆凭证",  value: "0" },
        17:{ lab: "gps状态",  value: "0" },
      },
      websock: null,
    };
  },
  created() {
    this.initWebSocket();
  },
  destroyed() {
    this.websock.close(); //离开路由之后断开websocket连接
  },
  methods: {
    submitcomd(arg){
      let arr =this.command_hex==''?undefined:this.command_hex.split(',');
      let actions = { command: parseInt(this.protocol),data:arr };
      console.log("submitcomd" , actions);
      this.websocketsend(JSON.stringify(actions));
    },
    submit(arg) {
      let d;
      if(this.configs[arg-1]){
        d=parseInt(this.configs[arg-1].value)
      }else{
        d=undefined
      }
      let actions = { command: arg, data: d!=undefined?[d]:undefined };
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
        this.rcvdata.unshift(redata.data.map((d) => d.toString(16)).toString());
        this.gpsData = redata;
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
  flex-direction: column;
  overflow: hidden;
}
</style>