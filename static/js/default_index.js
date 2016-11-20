// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    function get_posts_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return posts_url + "?" + $.param(pp);
    }

    self.add_post_button = function () {
        $("#newpost").addClass('hidden');
        self.vue.is_adding_post = true;
        self.vue.post_content = '';
    };

    self.delete_post = function (post_id, user_email) {
        $.post(del_post_url,
            {
                post_id: post_id,
                user_email: user_email
            },
            function (data) {
                if (data.isDeleted) {
                    var idx = null;
                    for (var i=0; i<self.vue.posts.length; i++) {
                        if (self.vue.posts[i].id === post_id) {
                            idx = i +1;
                            break;
                        }
                    }
                    if (idx) {
                        self.vue.posts.splice(idx-1, 1);
                    }
                }
            })
    };

    self.cancel_post_button = function () {
        self.vue.is_adding_post = false;
        $("#newpost").removeClass('hidden');
    };

    self.get_posts = function () {
        $.getJSON(get_posts_url(0,4), function (data) {
            self.vue.posts = data.posts;
            self.vue.has_more = data.has_more;
            self.vue.logged_in = data.logged_in;
        })
    };

    self.add_post = function () {
      console.log("add_post is called");
      $.post(add_post_url,
          {
              post_content: self.vue.post_content
          },
          function (data) {
              self.vue.posts.unshift(data.post);
          });
       self.cancel_post_button();
    };


    self.get_more = function () {
        var num_posts = self.vue.posts.length;
        $.getJSON(get_posts_url(num_posts, num_posts + 4), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.posts, data.posts);
        });
    };



    self.update_post = function (post) {
        console.log("update_post is called");
        $.post(update_post_url,
            {
                new_post_content: self.vue.post_edit_content,
                post_id: post.id
            },
            function (data) {
                for (var i=0; i<self.vue.posts.length; i++) {
                    if (self.vue.posts[i].id == data.post_id) {
                        self.vue.posts[i].post_content = data.post_content;
                        self.vue.posts[i].updated_on = data.updated_on;
                    }
                }
            }
        );
        post.post_edit = false;
    };

     self.edit_post = function (post) {
        post.post_edit = true;
        self.vue.post_edit_content = post.post_content;
    };

    self.cancel_editing = function (post) {
        post.post_edit = false;
    };


    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            has_more: false,
            logged_in: true,
            is_adding_post: false,
            posts: [],
            post_content: null,
            post_edit_content: null
        },
        methods: {
            add_post_button: self.add_post_button,
            cancel_post_button: self.cancel_post_button,
            get_more: self.get_more,
            add_post: self.add_post,
            delete_post: self.delete_post,
            edit_post: self.edit_post,
            cancel_editing: self.cancel_editing,
            update_post: self.update_post
        }

    });

    self.get_posts();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
