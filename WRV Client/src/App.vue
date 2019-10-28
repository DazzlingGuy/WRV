<template>
  <div class="app-container">
    <!-- herder -->
    <mt-header fixed title="Web Report Viewer"></mt-header>

    <!-- main router view -->
    <router-view></router-view>

    <!-- bottom toolbar -->
    <nav class="mui-bar mui-bar-tab">
      <router-link class="mui-tab-item" to="/filelist">
        <span class="glyphicon glyphicon-list"></span>
        <span class="mui-tab-label">File List</span>
      </router-link>
      <router-link class="mui-tab-item" to="/report">
        <span class="glyphicon glyphicon-search"></span>
        <span class="mui-tab-label">Preview</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>

<style>
</style>