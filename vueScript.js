var app = new Vue({
  el: "#app",
  data: {
    userPath: "",
    repoPath: "",

    branches: [],
    selectedBranch: "",

    remotes: [""],
    selectedRemote: "",

    commitHistory: [],

    filesForStaging: [],
    selectedFiles: [],

    commitMessage: "",

    error: false,
    errorMessage: "",

    isPushing: false,
    pushingLogs: "",

  },
  methods: {
    toggleStaged: function(file) {
      if (this.selectedFiles.includes(file)) {
        this.selectedFiles = this.selectedFiles.filter(name => name !== file);
      } else {
        this.selectedFiles = this.selectedFiles.concat([file])
      }

    },
    viewDiff: function() {
      fig.run('fig git diff')
    },
    commitAndPush: function () {
      console.log("commit and push clicked");

      // Git checkout, add, and commit first
      var firstCmdToExecute = `cd "${app.repoPath}" ; git checkout ${this.selectedBranch} ; git add ${this.selectedFiles.join(" ")} ; git commit -m '${this.commitMessage.replace(/'/g, '')}';`
      var output = ""
      fig.stream(firstCmdToExecute, (data, error) => {

        if (data) {
          // console.log(data)
          output += data + "\n"
          return
        }

        console.log("done", output)

        // Notify with toast
        var notyf = new Notyf({
          position: {
            x: "center",
            y: "top"
          }
        });
        notyf.success('Git Commited! Running Git push');

        // Show popup modal
        this.isPushing = true

        determineIfGitExists()
        this.commitMessage = ""

        // Show live git push logs
        fig.stream(`git push ${this.selectedRemote} ${this.selectedBranch};`, (out, err) => {

          if (!out) { fig.reposition("7") }
          console.log(out)
          this.pushingLogs += out + "<br/><br />"

        })

        // setTimeout(function () { window.location.reload(); }, 2000);

      })



    }
  }
});