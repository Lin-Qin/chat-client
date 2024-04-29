<script lang='ts' setup>
import { useRoute } from 'vue-router'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive include="ShopList">
      <component :is="Component" v-if="route.meta.keepAlive" :key="route.name" />
    </keep-alive>
    <component :is="Component" v-if="!route.meta.keepAlive" :key="route.name" />
  </router-view>
</template>
