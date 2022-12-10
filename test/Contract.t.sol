// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "src/Contract.sol";

contract ContractTest is Test {
    Blog blog;

    function setUp() public {
        blog = new Blog("Celestia Blog");
    }

    function testCreatePost() public {
        blog.createPost("My first post", "12345");
        Blog.Post[] memory posts = blog.fetchPosts();
        assertEq(posts.length, 1);
    }

    function testUpdatePost() public {
        blog.createPost("My first post", "12345");
        blog.updatePost(1, "My second post", "12345", true);
        Blog.Post memory updatedPost = blog.fetchPost("12345");
        assertEq(updatedPost.title, "My second post");
    }

    function testFetchPosts() public {
        Blog.Post[] memory posts = blog.fetchPosts();
        assertEq(posts.length, 0);
        blog.createPost("My first post", "12345");
        posts = blog.fetchPosts();
        assertEq(posts.length, 1);
    }

    function testOnlyOwner() public {
        blog.createPost("My first post", "12345");
        address bob = address(0x1);
        vm.startPrank(bob);
        vm.expectRevert();
        blog.updatePost(1, "My second post", "12345", true);
    }
}