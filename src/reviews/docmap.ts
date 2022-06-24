type ReviewingGroupId = string;
type ReviewingGroupName = string;
type ReviewingGroupLogoUrl = string;
type ReviewingGroupHomePageUrl = string;

type ReviewingGroup = {
  id: ReviewingGroupId
  name: ReviewingGroupName
  logo: ReviewingGroupLogoUrl
  homepage: ReviewingGroupHomePageUrl
};

export const generateDocMap = (doi: Doi, reviewingGroup: ReviewingGroup) => {

  return {
    "articles": [
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": `https://sciety.org/docmaps/v1/articles/${doi}/biophysics-colab.docmap.json`,
        "type": "docmap",
        "created": "2021-12-21T10:31:00.000Z",
        "updated": "2022-05-17T10:00:10.633Z",
        "publisher": {
          "id": reviewingGroup.id,
          "name": reviewingGroup.name,
          "logo": reviewingGroup.logo,
          "homepage": reviewingGroup.homepage,
          "account": {
            "id": reviewingGroup.id,
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": doi,
                "url": `https://doi.org/${doi}`
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-12-17T13:59:00.000Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/iDLPjF9BEeyhWi89_nqmpA"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.21203/rs.3.rs-955726/v1#hypothesis:iDLPjF9BEeyhWi89_nqmpA"
                      }
                    ]
                  }
                ]
              },
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-01-10T19:38:00.000Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/8h6HBnJMEeyIDzNrTJzkOA"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.21203/rs.3.rs-955726/v1#hypothesis:8h6HBnJMEeyIDzNrTJzkOA"
                      }
                    ]
                  }
                ]
              },
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-05-17T09:52:32.797Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/EqExCNXHEey74zd9EjVy7g"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.21203/rs.3.rs-955726/v1#hypothesis:EqExCNXHEey74zd9EjVy7g"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2021.09.22.461361/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2022-05-15T18:40:12.524Z",
        "updated": "2022-05-15T18:40:12.524Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2021.09.22.461361",
                "url": "https://doi.org/10.1101/2021.09.22.461361"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-05-15T18:31:57.317Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/TTuwQNR9EeyJk9fweSeKaQ"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.09.22.461361#hypothesis:TTuwQNR9EeyJk9fweSeKaQ"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2022.01.11.475879/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2022-05-13T16:10:06.557Z",
        "updated": "2022-05-13T17:50:06.742Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2022.01.11.475879",
                "url": "https://doi.org/10.1101/2022.01.11.475879"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-05-13T16:01:02.535Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/41cZatLVEey1HP_4PwRq4A"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2022.01.11.475879#hypothesis:41cZatLVEey1HP_4PwRq4A"
                      }
                    ]
                  }
                ]
              },
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-05-13T17:45:38.548Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/gE2TTtLkEeyFhu9vvemMKw"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2022.01.11.475879#hypothesis:gE2TTtLkEeyFhu9vvemMKw"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2021.06.18.449063/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2021-09-10T07:27:34.000Z",
        "updated": "2022-04-28T18:10:05.991Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2021.06.18.449063",
                "url": "https://doi.org/10.1101/2021.06.18.449063"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-09-09T17:33:15.170Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/A4Xd2BGUEeyIxaNhlAiqaQ"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.06.18.449063#hypothesis:A4Xd2BGUEeyIxaNhlAiqaQ"
                      }
                    ]
                  }
                ]
              },
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-04-28T18:01:37.340Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/P5UMTMcdEeyNjRPVL7ph8g"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.06.18.449063#hypothesis:P5UMTMcdEeyNjRPVL7ph8g"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2022.02.23.481615/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2022-04-27T08:10:05.784Z",
        "updated": "2022-04-27T08:10:05.784Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2022.02.23.481615",
                "url": "https://doi.org/10.1101/2022.02.23.481615"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-04-27T08:01:27.402Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/PWlFMsYAEeyoOMsYgfQZig"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2022.02.23.481615#hypothesis:PWlFMsYAEeyoOMsYgfQZig"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.21203/rs.3.rs-1043992/v1/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2022-04-19T11:40:09.289Z",
        "updated": "2022-04-19T11:40:09.289Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.21203/rs.3.rs-1043992/v1",
                "url": "https://doi.org/10.21203/rs.3.rs-1043992/v1"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2022-04-19T11:35:26.469Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/ztQE-L_UEey5hB8TupDhxw"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.21203/rs.3.rs-1043992/v1#hypothesis:ztQE-L_UEey5hB8TupDhxw"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2021.07.01.450694/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2021-12-01T15:48:31.000Z",
        "updated": "2021-12-01T15:48:31.000Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2021.07.01.450694",
                "url": "https://doi.org/10.1101/2021.07.01.450694"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-11-30T16:01:02.674Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/t-OB3lH2EeynaRevwmKCzQ"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.07.01.450694#hypothesis:t-OB3lH2EeynaRevwmKCzQ"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2021.03.21.436299/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2021-09-21T14:55:29.000Z",
        "updated": "2021-09-28T07:03:41.000Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2021.03.21.436299",
                "url": "https://doi.org/10.1101/2021.03.21.436299"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-09-21T14:47:40.655Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/3wxXsBrqEeysRyM70lofBA"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.03.21.436299#hypothesis:3wxXsBrqEeysRyM70lofBA"
                      }
                    ]
                  }
                ]
              },
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-09-27T14:58:30.008Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/YI_I-h-jEey0ua_bFBS9pA"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.03.21.436299#hypothesis:YI_I-h-jEey0ua_bFBS9pA"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2021.05.28.446245/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2021-09-10T07:27:34.000Z",
        "updated": "2021-09-10T07:27:34.000Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2021.05.28.446245",
                "url": "https://doi.org/10.1101/2021.05.28.446245"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-09-09T17:51:39.430Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/lcIarBGWEey7Nf80DJ2xJQ"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.05.28.446245#hypothesis:lcIarBGWEey7Nf80DJ2xJQ"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        "@context": "https://w3id.org/docmaps/context.jsonld",
        "id": "https://sciety.org/docmaps/v1/articles/10.1101/2021.07.05.451181/biophysics-colab.docmap.json",
        "type": "docmap",
        "created": "2021-09-08T15:06:52.000Z",
        "updated": "2021-09-08T15:06:52.000Z",
        "publisher": {
          "id": "https://biophysics.sciencecolab.org",
          "name": "Biophysics Colab",
          "logo": "https://sciety.org/static/groups/biophysics-colab--4bbf0c12-629b-4bb8-91d6-974f4df8efb2.png",
          "homepage": "https://biophysics.sciencecolab.org",
          "account": {
            "id": "https://sciety.org/groups/biophysics-colab",
            "service": "https://sciety.org"
          }
        },
        "first-step": "_:b0",
        "steps": {
          "_:b0": {
            "assertions": [],
            "inputs": [
              {
                "doi": "10.1101/2021.07.05.451181",
                "url": "https://doi.org/10.1101/2021.07.05.451181"
              }
            ],
            "actions": [
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-09-08T14:51:35.722Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/Q9GJ9BC0EeyPVBtgAn5Yjw"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.07.05.451181#hypothesis:Q9GJ9BC0EeyPVBtgAn5Yjw"
                      }
                    ]
                  }
                ]
              },
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-09-08T14:28:19.243Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/A2ZbGBCxEeyu-CsIpygfMQ"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.07.05.451181#hypothesis:A2ZbGBCxEeyu-CsIpygfMQ"
                      }
                    ]
                  }
                ]
              },
              {
                "participants": [
                  {
                    "actor": {
                      "name": "anonymous",
                      "type": "person"
                    },
                    "role": "peer-reviewer"
                  }
                ],
                "outputs": [
                  {
                    "type": "review-article",
                    "published": "2021-09-08T14:57:57.652Z",
                    "content": [
                      {
                        "type": "web-page",
                        "url": "https://hypothes.is/a/J2qSChC1EeyvHS8fi9T9oQ"
                      },
                      {
                        "type": "web-page",
                        "url": "https://sciety.org/articles/activity/10.1101/2021.07.05.451181#hypothesis:J2qSChC1EeyvHS8fi9T9oQ"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      }
    ]
  };
}
