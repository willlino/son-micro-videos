<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use App\Models\Genre;
use App\Models\Traits\UploadFiles;
use App\Models\Video;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestUploads;
use Tests\Traits\TestValidations;

class VideoControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves, TestUploads;
    private $video;
    private $sendData;

    protected function setUp(): void
    {
        parent::setUp();
        $this->video = factory(Video::class)->create(['opened' => false]);
        $this->sendData = [
            'title' => 'title',
            'description' => 'description',
            'year_launched' => 2010,
            'rating' => Video::RATING_LIST[0],
            'duration' => 90
        ];
    }

    public function testIndex()
    {
        $response = $this->get(route('videos.index'));

        $response
            ->assertStatus(200)
            ->assertJson([$this->video->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('videos.show', ['video' => $this->video->id]));

        $response
            ->assertStatus(200)
            ->assertJson($this->video->toArray());
    }

    public function testInvalidationRequired()
    {
        $data = [
            'title' => '',
            'description' => '',
            'year_launched' => '',
            'rating' => '',
            'duration' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');
    }

    public function testInvalidationMax()
    {
        $data = [
            'title' => str_repeat('a', 256),
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
    }

    public function testInvalidationSmallInteger()
    {
        $data = [
            'duration' => 'p',
        ];
        $this->assertInvalidationInStoreAction($data, 'integer');
        $this->assertInvalidationInUpdateAction($data, 'integer');
    }

    public function testInvalidationYearLaunchedField()
    {
        $data = [
            'year_launched' => 'a',
        ];
        $this->assertInvalidationInStoreAction($data, 'date_format', ['format' => 'Y']);
        $this->assertInvalidationInUpdateAction($data, 'date_format', ['format' => 'Y']);
    }

    public function testInvalidationBoolean()
    {
        $data = [
            'opened' => 's',
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testInvalidationRatingField()
    {
        $data = [
            'rating' => 0,
        ];
        $this->assertInvalidationInStoreAction($data, 'in');
        $this->assertInvalidationInUpdateAction($data, 'in');
    }

    public function testInvalidationCategoriesIdField()
    {
        $data = [
            'categories_id' => 's',
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'categories_id' => [100],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $category = factory(Category::class)->create();
        $category->delete();
        $data = [
            'categories_id' => [$category->id],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationGenresIdField()
    {
        $data = [
            'genres_id' => 's',
        ];
        $this->assertInvalidationInStoreAction($data, 'array');
        $this->assertInvalidationInUpdateAction($data, 'array');

        $data = [
            'genres_id' => [100],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');

        $genre = factory(Genre::class)->create();
        $genre->delete();
        $data = [
            'genres_id' => [$genre->id],
        ];
        $this->assertInvalidationInStoreAction($data, 'exists');
        $this->assertInvalidationInUpdateAction($data, 'exists');
    }

    public function testInvalidationVideoField()
    {
        $this->assertInvalidationFile(
            'video_file',
            'mp4',
            12,
            'mimetypes',
            ['values' => 'video/mp4']
        );
    }

    public function testSaveWithoutFiles()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $data = [
            [
                'send_data' => $this->sendData + [
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sendData + ['opened' => false]
            ],
            [
                'send_data' => $this->sendData + [
                    'opened' => true,
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sendData + ['opened' => true]
            ],
            [
                'send_data' => $this->sendData + [
                    'rating' => Video::RATING_LIST[1],
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sendData + ['rating' => Video::RATING_LIST[1]]
            ]
        ];

        foreach($data as $key => $value){
            $response = $this->assertStore(
                $value['send_data'], 
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
            ]);
            $this->assertHasCategory(
                $response->json('id'),
                $value['send_data']['categories_id'][0]
            );
            $this->assertHasGenre(
                $response->json('id'),
                $value['send_data']['genres_id'][0]
            );
            
            $response = $this->assertUpdate(
                $value['send_data'],
                $value['test_data'] + ['deleted_at' => null]
            );
            $response->assertJsonStructure([
                'created_at',
                'updated_at'
            ]);
            $this->assertHasCategory(
                $response->json('id'),
                $value['send_data']['categories_id'][0]
            );
            $this->assertHasGenre(
                $response->json('id'),
                $value['send_data']['genres_id'][0]
            );
        }
    }

    public function testStoreWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData + [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] +
            $files
        );

        $response->assertStatus(201);
        $id = $response->json('id');
        foreach($files as $file){
            \Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    public function testUpdateWithFiles()
    {
        \Storage::fake();
        $files = $this->getFiles();

        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);

        $response = $this->json(
            'PUT',
            $this->routeUpdate(),
            $this->sendData + [
                'categories_id' => [$category->id],
                'genres_id' => [$genre->id]
            ] +
            $files
        );

        $response->assertStatus(200);
        $id = $response->json('id');
        foreach($files as $file){
            \Storage::assertExists("$id/{$file->hashName()}");
        }
    }

    protected function getFiles(){
        return [
            'video_file' => UploadedFile::fake()->create('video_file.mp4')
        ];
    }

    public function testSave()
    {
        $category = factory(Category::class)->create();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($category->id);
        $data = [
            [
                'send_data' => $this->sendData + [
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sendData + ['opened' => false]
            ],
            [
                'send_data' => $this->sendData + [
                    'opened' => true,
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sendData + ['opened' => true]
            ],
            [
                'send_data' => $this->sendData + [
                    'rating' => Video::RATING_LIST[1],
                    'categories_id' => [$category->id],
                    'genres_id' => [$genre->id]
                ],
                'test_data' => $this->sendData + ['rating' => Video::RATING_LIST[1]]
            ]
        ];

        foreach ($data as $key => $value) {
            $response = $this->assertStore($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
            $this->assertHasCategory($response->json('id'), $value['send_data']['categories_id'][0]);
            $this->assertHasGenre($response->json('id'), $value['send_data']['genres_id'][0]);

            $response = $this->assertUpdate($value['send_data'], $value['test_data'] + ['deleted_at' => null]);
            $response->assertJsonStructure([
                'created_at', 'updated_at'
            ]);
            $this->assertHasCategory($response->json('id'), $value['send_data']['categories_id'][0]);
            $this->assertHasGenre($response->json('id'), $value['send_data']['genres_id'][0]);
        }
    }

    protected function assertHasCategory($videoId, $categoryId)
    {
        $this->assertDatabaseHas('category_video', [
            'video_id' => $videoId,
            'category_id' => $categoryId
        ]);
    }

    protected function assertHasGenre($videoId, $genreId)
    {
        $this->assertDatabaseHas('genre_video', [
            'video_id' => $videoId,
            'genre_id' => $genreId
        ]);
    }

    public function testSyncCategories()
    {
        $categoriesId = factory(Category::class, 3)->create()->pluck('id')->toArray();
        $genre = factory(Genre::class)->create();
        $genre->categories()->sync($categoriesId);
        $genreId = $genre->id;

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData + [
                'genres_id' => [$genreId],
                'categories_id' => [$categoriesId[0]]
            ]
        );

        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' =>  $response->json('id')
        ]);

        $response = $this->json(
            'PUT',
            route('videos.update', ['video' => $response->json('id')]),
            $this->sendData + [
                'genres_id' => [$genreId],
                'categories_id' => [$categoriesId[1], $categoriesId[2]]
            ]
        );
        $this->assertDatabaseMissing('category_video', [
            'category_id' => $categoriesId[0],
            'video_id' =>  $response->json('id')
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[1],
            'video_id' =>  $response->json('id')
        ]);
        $this->assertDatabaseHas('category_video', [
            'category_id' => $categoriesId[2],
            'video_id' =>  $response->json('id')
        ]);
    }

    public function testSyncGenres()
    {
        $genres = factory(Genre::class, 3)->create();
        $genresId = $genres->pluck('id')->toArray();
        $categoryId = factory(Category::class)->create()->id;
        $genres->each(function ($genre) use ($categoryId) {
            $genre->categories()->sync($categoryId);
        });

        $response = $this->json(
            'POST',
            $this->routeStore(),
            $this->sendData + [
                'genres_id' => [$genresId[0]],
                'categories_id' => [$categoryId]
            ]
        );

        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' =>  $response->json('id')
        ]);

        $response = $this->json(
            'PUT',
            route('videos.update', ['video' => $response->json('id')]),
            $this->sendData + [
                'genres_id' => [$genresId[1], $genresId[2]],
                'categories_id' => [$categoryId]
            ]
        );
        $this->assertDatabaseMissing('genre_video', [
            'genre_id' => $genresId[0],
            'video_id' =>  $response->json('id')
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[1],
            'video_id' =>  $response->json('id')
        ]);
        $this->assertDatabaseHas('genre_video', [
            'genre_id' => $genresId[2],
            'video_id' =>  $response->json('id')
        ]);
    }

    // public function testRollbackStore()
    // {
    //     $controller = $this->mock(VideoController::class)
    //         ->makePartial()
    //         ->shouldAllowMockingProtectedMethods();

    //     $controller->shouldReceive('validate')
    //         ->withAnyArgs()
    //         ->andReturn($this->sendData);

    //     $controller->shouldReceive('rulesStore')
    //         ->withAnyArgs()
    //         ->andReturn([]);

    //     $controller->shouldReceive('handleRelations')
    //         ->once()
    //         ->andThrow(new TestException());

    //     $request = $this->mock(Request::class);

    //     $request->shouldReceive('get')
    //         ->withAnyArgs()
    //         ->AndReturnNull();

    //     $hasError = false;
    //     try {
    //         $controller->store($request);
    //     } catch (TestException $exception) {
    //         $this->assertCount(1, Video::all());
    //         $hasError = true;
    //     }

    //     $this->assertTrue($hasError);
    // }

    // public function testRollbackUpdate()
    // {
    //     $controller = $this->mock(VideoController::class)
    //         ->makePartial()
    //         ->shouldAllowMockingProtectedMethods();

    //     $controller->shouldReceive('findOrFail')
    //         ->withAnyArgs()
    //         ->andReturn($this->video);

    //     $controller->shouldReceive('validate')
    //         ->withAnyArgs()
    //         ->andReturn(['name' => 'test']);

    //     $controller->shouldReceive('rulesStore')
    //         ->withAnyArgs()
    //         ->andReturn(['name' => 'required|max:255']);

    //     $controller->shouldReceive('handleRelations')
    //         ->once()
    //         ->andThrow(new TestException());

    //     $request = $this->mock(Request::class);

    //     $request->shouldReceive('get')
    //         ->withAnyArgs()
    //         ->AndReturnNull();

    //     $hasError = false;
    //     try {
    //         $controller->update($request, 1);
    //     } catch (TestException $exception) {
    //         $this->assertCount(1, Video::all());
    //         $hasError = true;
    //     }

    //     $this->assertTrue($hasError);
    // }


    public function testDestroy()
    {
        $response = $this->delete(route('videos.destroy', ['video' => $this->video->id]));

        $videos = Video::all();
        $this->assertEmpty($videos);

        $videos = Video::onlyTrashed()->get();
        $this->assertCount(1, $videos);

        $response
            ->assertStatus(204);
    }

    protected function routeStore()
    {
        return route('videos.store');
    }

    protected function routeUpdate()
    {
        return route('videos.update', ['video' => $this->video->id]);
    }

    protected function model()
    {
        return Video::class;
    }
}
