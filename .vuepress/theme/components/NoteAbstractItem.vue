<template>
	<div class="abstract-item draw" @click="$router.push(item.path)">
		<reco-icon v-if="item.frontmatter.sticky" icon="reco-sticky" />
		<div v-if="item.frontmatter.cover" class="cover">
			<img class="cover-img" :src="item.frontmatter.cover" alt=" item.title" />
		</div>
		<div style="width: 50%; float: left">
			<div class="title">
				<reco-icon v-if="item.frontmatter.keys" icon="reco-lock" />
				<router-link :to="item.path">{{ item.title }}</router-link>
			</div>
			<div class="abstract" v-html="item.excerpt"></div>
		</div>
		<div>
			<PageInfo :pageInfo="item" :currentTag="currentTag"> </PageInfo>
		</div>
	</div>
</template>

<script>
import { defineComponent } from "vue-demi";
import { RecoIcon } from "@vuepress-reco/core/lib/components";
import PageInfo from "./PageInfo";
export default defineComponent({
	components: { PageInfo, RecoIcon },
	props: ["item", "currentPage", "currentTag"],
	methods: {
	},
});
</script>

<style lang="stylus" scoped>
.abstract-item {
    position: relative;
    margin: 0 auto 20px;
    padding: 16px 20px;
    width: 100%;
    overflow: hidden;
    border-radius: $borderRadius;
    box-shadow: var(--box-shadow);
    box-sizing: border-box;
    transition: all 0.3s;
    background-color: var(--background-color);
    cursor: pointer;

    > * {
        pointer-events: auto;
    }

    .reco-sticky {
        position: absolute;
        top: 0;
        left: 0;
        display: inline-block;
        color: $accentColor;
        font-size: 2.4rem;
    }

    &:hover {
        box-shadow: var(--box-shadow-hover);
    }


		.cover {
			width:50%;
			float: left;
      overflow : hidden;
      border-radius :.5rem;

	    .cover-img {
				float:left;
				border-radius : .5rem
				width: 80%;
				transition : 1s ease-out;
			}

			.cover-img:hover{
				transform : scale(1.05);
			}
		}

    .title {
        position: relative;
        font-size: 1.28rem;
        line-height: 46px;
        display: inline-block;
				flex:2;
        a {
            color: var(--text-color);
        }

        .reco-lock {
            font-size: 1.28rem;
            color: $accentColor;
        }

        &:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            bottom: 0;
            left: 0;
            background-color: $accentColor;
            visibility: hidden;
            -webkit-transform: scaleX(0);
            transform: scaleX(0);
            transition: 0.3s ease-in-out;
        }

        &:hover a {
            color: $accentColor;
        }

        &:hover:after {
            visibility: visible;
            -webkit-transform: scaleX(1);
            transform: scaleX(1);
        }
    }

		.abstract {
			color: '#999'
		}

    .tags {
        .tag-item {
            &.active {
                color: $accentColor;
            }

            &:hover {
                color: $accentColor;
            }
        }
    }

}
@media (max-width: $MQMobile) {
    .tags {
        display: block;
        margin-top: 1rem;
        margin-left: 0 !important;
    }
}
</style>
