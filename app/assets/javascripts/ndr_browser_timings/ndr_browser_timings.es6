/* This ES6 version is left in place; at the time of writing, lack of browser
 * support means a transpilation step would be necessary. The preferred way to
 * achieve that in the Rails ecosystem is with Babel, embedded via webpacker.
 *
 * However, engine support for webpacker is not really there yet, so instead
 * this gem currently bundles an primitive implementation that should work cross-browser.
 */
class NdrBrowserTimings {
  constructor (endpoint) {
    // Path to which data is sent:
    this.endpoint = this.readMetaTag('ndr_broser_timings_endpoint')

    // resource timings that have been sent:
    this.recordedEntries = []

    if (this.endpoint) this.bindListeners()
  }

  bindListeners () {
    window.addEventListener('load', () => {
      // Defer the timing collection in order to allow the onLoad event to finish first.
      setTimeout(() => { this.sendPerformanceTimingData() }, 0)

      // Periodically, send timing for AJAX requests:
      setInterval(() => { this.sendNewPerformanceResourceTimingData() }, 1000)
    })
  }

  sendPerformanceTimingData () {
    this.sendTimingData({
      pathname: window.location.pathname,
      performance_timing: window.performance.timing
    })
  }

  sendNewPerformanceResourceTimingData () {
    var newEntries = window.performance.getEntriesByType('resource')
      .filter((entry) => { return !~this.recordedEntries.indexOf(entry) })
      .filter((entry) => { return !~entry.name.indexOf(this.endpoint) })

    newEntries.forEach((resourceTiming) => { this.recordedEntries.push(resourceTiming) })

    if (newEntries.length) this.sendTimingData({ resource_timings: newEntries })
  }

  sendTimingData (data) {
    var request = new XMLHttpRequest()
    var token = this.readMetaTag('csrf-token')

    data.user_agent = navigator.userAgent

    request.open('POST', this.endpoint)
    if (token) request.setRequestHeader('X-CSRF-Token', token)
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.send(JSON.stringify(data))
  }

  readMetaTag (name) {
    var metaTag = document.querySelector('meta[name="' + name + '"]')
    return metaTag && metaTag.content
  }
}

new NdrBrowserTimings()
