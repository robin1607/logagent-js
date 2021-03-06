'use strict'
var safeStringify = require('fast-safe-stringify')
var kafka = require('kafka-native')
var consoleLogger = require('../../util/logger.js')

/**
 * Constructor called by logagent
 * @config cli arguments and config.configFile entries
 * @eventEmitter logent eventEmitter object
 */
function InputKafka (config, eventEmitter) {
  this.config = config
  this.eventEmitter = eventEmitter
  ;
}
module.exports = InputKafka
/**
 * Plugin start function, called after constructor
 *
 */
InputKafka.prototype.start = function () {
  if (!this.started) {
    this.started = true
    this.createServer()
    consoleLogger.log("kafka input plugin started")
  }
}



InputKafka.prototype.createServer = function () {
    consoleLogger.log('start kafkaConsumer ')
    var brokerVar = this.config.brokerAddress + ':' + this.config.brokerPort
    var topicVar = this.config.topic;
    var eventEmitter = this.eventEmitter
    global.kafkaConsumer = new kafka.Consumer({
    broker: brokerVar,
    topic: topicVar,
    offset_directory: this.config.offset_directory,
    receive_callback: function(data) {
        data.messages.forEach(function(m) {
            eventEmitter.emit('data.raw',  m.payload, {sourceName: 'kafka' + brokerVar, topic: m.topic, partition: m.partition, offset:m.offset})
        });
        return Promise.resolve();
    }
    });

    kafkaConsumer.start()

}

/**
 * Plugin stop function, called when logagent terminates
 * we close kafka consumer.
 */
InputKafka.prototype.stop = function (cb) {
    consoleLogger.log('stop kafkaConsumer')
    kafkaConsumer.stop()
    cb()
}

